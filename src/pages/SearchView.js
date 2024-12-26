import React, { useState } from 'react'
import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import ButtonGroup from '@mui/joy/ButtonGroup'
import { Link } from 'react-router-dom';

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

function displayDonate(donate) {
  if (donate === true) {
    return <h3 style={{ color: "green" }}>Donate</h3>
  }
  if (donate === false) {
    return <h3 style={{ color: "red" }}>Take back</h3>
  }
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

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [consigners, setConsigners] = useState([]);
  const [editedNumbers, setEditedNumbers] = useState({});

  async function updateConsignerNumber(id, number) {
    await fetch(`http://localhost:8080/consigners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number, 10) || null })
    });
    if (query) {
      searchConsigners(query);
    }
  }

  async function searchConsigners(q) {
    const response = await fetch(`http://localhost:8080/consigners/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    setConsigners(data);
  }

  // Handle changes to the search query
  function handleSearchChange(e) {
    const val = e.target.value;
    setQuery(val);
    // Only fetch if there's a query
    if (val.trim() !== "") {
      searchConsigners(val.trim());
    } else {
      setConsigners([]);
    }
  }

  return (
    <div>
      <div style={bannerStyle}>
        <h1>Search Consigners</h1>
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Input
          color="primary"
          variant="outlined"
          placeholder="Search by Name or Phone"
          style={{ width: "400px", height: "40px" }}
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <div style={listTitles}>
        <h2>Time</h2>
        <h2>Name</h2>
        <h2>Phone</h2>
        <h2>Bags</h2>
        <h2>Donate?</h2>
        <h2>Number</h2>
      </div>

      <div>
        {consigners.map((ex) => {
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
  );
}

