const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Update these credentials based on your setup
const pool = new Pool({
  user: 'dylanlewis',
  host: 'localhost',
  database: 'consignment_db',
  password: 'Dylan123$',
  port: 5432,
});

// GET all consigners
app.get('/consigners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consigners ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// POST a new consigner
app.post('/consigners', async (req, res) => {
  const { name, phone, bags, isDonate, is_new } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO consigners (name, phone, bags, is_donate, is_new) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phone, bags, isDonate, is_new]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/consigners/bydate/:date', async (req, res) => {
  const { date } = req.params;
  try {
    // Assuming created_at is a TIMESTAMP column
    // We can filter by converting created_at to a date
    const result = await pool.query(
      `SELECT * FROM consigners 
       WHERE CAST(created_at AS DATE) = $1 
       ORDER BY created_at DESC`,
      [date]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching consigners by date:', error);
    res.status(500).send('Server error');
  }
});

app.get('/consigners/search', async (req, res) => {
  const { q } = req.query; // The search query passed as ?q=someValue
  if (!q) {
    return res.json([]); // If no query provided, return empty array or handle differently
  }
  
  try {
    const result = await pool.query(
      `SELECT * FROM consigners
       WHERE name ILIKE $1 OR phone ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching consigners by search query:', error);
    res.status(500).send('Server error');
  }
});

// PUT to update a consigner
app.put('/consigners/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    bags,
    is_donate,
    is_new,
    took_nothing,
    buyout_amount,
    number,
    is_buyout // Newly added field
  } = req.body;

  // Log the incoming request body for debugging
  console.log(`Received PUT request for Consigner ID: ${id}`);
  console.log('Request Body:', req.body);

  // We’ll create a dynamic set of fields to update based on what’s provided
  const fields = [];
  const values = [];
  let i = 1;

  if (name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(name);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${i++}`);
    values.push(phone);
  }
  if (bags !== undefined) {
    fields.push(`bags = $${i++}`);
    values.push(bags);
  }
  if (is_donate !== undefined) {
    fields.push(`is_donate = $${i++}`);
    values.push(is_donate);
  }
  if (is_new !== undefined) {
    fields.push(`is_new = $${i++}`);
    values.push(is_new);
  }
  if (took_nothing !== undefined) {
    fields.push(`took_nothing = $${i++}`);
    values.push(took_nothing);
  }
  if (buyout_amount !== undefined) {
    fields.push(`buyout_amount = $${i++}`);
    values.push(buyout_amount);
  }
  if (number !== undefined) {
    fields.push(`number = $${i++}`);
    values.push(number);
  }
  if (is_buyout !== undefined) { // Newly added condition
    fields.push(`is_buyout = $${i++}`);
    values.push(is_buyout);
  }

  if (fields.length === 0) {
    return res.status(400).send('No fields to update');
  }

  const query = `UPDATE consigners SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
  values.push(id);

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).send('Consigner not found');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating consigner:', error);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

