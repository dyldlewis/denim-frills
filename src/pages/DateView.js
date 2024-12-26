import React, { useState, useEffect } from 'react'
import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Checkbox from '@mui/joy/Checkbox'
import { Link } from 'react-router-dom';


// Reuse or replicate styling from the Home page
const listTitles = {
  display: 'grid',
  justifyContent: 'space-evenly',
  gridTemplateColumns: '100px 100px 100px 100px 100px 250px',
  alignItems: 'center',
  textAlign: 'center',
  margin: "10px",
}

const consignerList = {
  display: 'grid',
  justifyContent: 'space-evenly',
  gridTemplateColumns: '100px 100px 100px 100px 100px 250px',
  alignItems: 'center',
  textAlign: 'center',
  margin: '10px',
  border: 'solid grey 1px'
}

const bannerStyle = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  width: "100vw",
  marginBottom: "30px"
}

// Helper functions from the Home page
function displayDonate(donate) {
  if (donate === true) {
    return <h3 style={{ color: "green" }}>Donate</h3>
  }
  if (donate === false) {
    return <h3 style={{ color: "red" }}>Take back</h3>
  }
}

function formatTimestamp(timestamp) {
  const dateObj = new Date(timestamp);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  const ampm = hours < 12 ? 'am' : 'pm';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${month}/${day} ${hours}:${formattedMinutes}${ampm}`;
}

export default function DateView() {
  const [selectedDate, setSelectedDate] = useState("");
  const [consigners, setConsigners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedNumbers, setEditedNumbers] = useState({});

  // We won't have the add form here; this page is for viewing historical data.
  // We'll use the PUT request logic if we still want to allow number updates retroactively.

  async function fetchConsignersByDate(date) {
    if (!date) return; // If no date selected, don't fetch
    const response = await fetch(`http://localhost:8080/consigners/bydate/${date}`);
    const data = await response.json();
    setConsigners(data);
    console.log(data)
  }

  // Update consigner's number (same logic as in Home)
  async function updateConsignerNumber(id, number) {
    await fetch(`http://localhost:8080/consigners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number, 10) || null })
    });
    // After updating, refetch consigners for the selected date
    fetchConsignersByDate(selectedDate);
    // Clear the edited number state for this consigner
    setEditedNumbers(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }

  function tookNothing(arg) {
    if (arg === true) {
      return <div style={{color: "red", marginRight: "5px"}}>Took Nothing</div>
    }
  }

  function displayBuyout(arg) {
    if (arg.is_buyout === true) {
      return <div style={{color: "red"}}>Buyout: {arg.buyout_amount}</div>
    }
  }

  // Filter consigners by search query
  const filteredConsigners = consigners.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.phone.includes(searchQuery)
  );

  return (
    <div>
      <div style={bannerStyle}>
        <h1>View Consigners By Date</h1>
        <ButtonGroup>
          <Button>
            <Link to="/">
              Home
            </Link>
          </Button>
          <Button>
            <Link to="/date-view">
              Date View
            </Link>
          </Button>
          <Button>
            <Link to="/search-view">
            Name search
            </Link>
          </Button>
        </ButtonGroup>
      </div>

      {/* Date Picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <Input
          type="date"
          color="primary"
          variant="outlined"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            fetchConsignersByDate(e.target.value);
          }}
          style={{ width: "250px", height: "40px", marginRight: "20px" }}
        />
        <Input
          color="primary"
          variant="outlined"
          placeholder="Search"
          style={{ width: "250px", height: "40px" }}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={listTitles}>
        <h2>Time</h2>
        <h2>Name</h2>
        <h2>Phone</h2>
        <h2>Bags</h2>
        <h2>Donate</h2>
        <h2>Number</h2>
      </div>

      <div>
        {filteredConsigners.map((ex) => {
          const currentNumberValue = editedNumbers[ex.id] !== undefined ? editedNumbers[ex.id] : (ex.number || "");
          return (
            <div key={ex.id} style={consignerList}>
              <h3>{formatTimestamp(ex.created_at)}</h3>
              <h3>{ex.name}</h3>
              <h3>{ex.phone}</h3>
              <h3>{ex.bags}</h3>
              {displayDonate(ex.is_donate)}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tookNothing(ex.took_nothing)}
                {displayBuyout(ex)} 
                <Input
                  color="primary"
                  value={currentNumberValue}
                  variant="outlined"
                  placeholder="Number"
                  onChange={(e) => setEditedNumbers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                  style={{ width: "80px", height: "40px", marginRight: "10px" }}
                />
                <Button variant="solid" style={{ width: "60px" }} onClick={() => updateConsignerNumber(ex.id, currentNumberValue)}>
                  Submit
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

