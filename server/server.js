const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');

const pool = new Pool({
  user: 'dylanlewis',
  host: 'localhost',
  database: 'consignment_db',
  password: 'Dylan123$',
  port: 5432, // default Postgres port
});
const app = express();

app.use(cors());
app.use(express.json());

app.get('/consigners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consigners ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/consigners', async (req, res) => {
  const { name, phone, bags, isDonate } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO consigners (name, phone, bags, is_donate) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, bags, isDonate]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.put('/consigners/:id', async (req, res) => {
  const { id } = req.params;
  const { number } = req.body; // The updated number passed from the front end

  try {
    // Update the consigner’s number based on their ID
    const result = await pool.query(
      'UPDATE consigners SET number = $1 WHERE id = $2 RETURNING *',
      [number, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Consigner not found');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating consigner number:', error);
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


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


