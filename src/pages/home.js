import React, { useState, useEffect } from 'react'
import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Checkbox from '@mui/joy/Checkbox'
import ButtonGroup from '@mui/joy/ButtonGroup'
import { Link } from 'react-router-dom';

export default function Home() {
  const addConsigner = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: '100px 100px 100px 100px 100px',
    alignItems: 'center',
    textAlign: 'center',
    margin: "10px",
  }

  const listTitles = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: '100px 100px 100px 100px 100px 150px',
    alignItems: 'center',
    textAlign: 'center',
    margin: "10px",
  }

  const consignerList = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: '100px 100px 100px 100px 100px 150px',
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

  // Format the DB timestamp into month/day and 12-hour time with am/pm
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

  // Check if a timestamp (ex.created_at) is from the current calendar day
  function isToday(timestamp) {
    const dateObj = new Date(timestamp);
    const today = new Date();
    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    );
  }

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [bags, setBags] = useState("")
  const [isDonate, setIsDonate] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");
  const [consigner, setConsigner] = useState([])

  // This will store the edited number per consigner ID
  // { [id]: "newNumberValue" }
  const [editedNumbers, setEditedNumbers] = useState({});

  async function fetchConsigners() {
    const response = await fetch('http://localhost:8080/consigners');
    const data = await response.json();
    setConsigner(data);
  }

  async function addNewConsigner() {
    await fetch('http://localhost:8080/consigners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, bags, isDonate })
    });
    // After adding, refetch the list
    fetchConsigners();
    // Clear form
    setName("");
    setPhone("");
    setBags("");
    setIsDonate(false);
  }

  // Update consigner's number
  async function updateConsignerNumber(id, number) {
    await fetch(`http://localhost:8080/consigners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number, 10) || null })
    });
    // After updating, refetch consigners
    fetchConsigners();
    // Clear the edited number state for this consigner
    setEditedNumbers(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }

  useEffect(() => {
    fetchConsigners();
  }, []);

  // Filter consigners to only show those from today
  const todaysConsigners = consigner.filter(ex => isToday(ex.created_at));

  // Now apply the search filter to today's consigners
  const filteredConsigners = todaysConsigners.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.phone.includes(searchQuery)
  );

  return (
    <div>
      <div style={bannerStyle}>
        <h1>Denim & Frills Consigners</h1>
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
      <div style={addConsigner}>
        <Input
          color="primary"
          variant="outlined"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "250px", height: "40px" }}
        />
        <Input
          color="primary"
          variant="outlined"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "250px", height: "40px" }}
        />
        <Input
          color="primary"
          variant="outlined"
          placeholder="Bags"
          value={bags}
          onChange={(e) => setBags(e.target.value)}
          style={{ width: "250px", height: "40px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Checkbox
            color="success"
            size="lg"
            variant="outlined"
            checked={isDonate}
            onChange={() => setIsDonate(!isDonate)}
          />
          <h4>Donate</h4>
        </div>
        <Button variant="solid" onClick={addNewConsigner}>Submit</Button>
      </div>
      <div style={listTitles}>
        <h2>Time</h2>
        <h2>Name</h2>
        <h2>Phone</h2>
        <h2>Bags</h2>
        <h2>Donate?</h2>
        <h2>Number</h2>
      </div>
      <Input
        color="primary"
        variant="outlined"
        placeholder="Search"
        style={{ width: "400px", height: "40px", marginLeft: "10px" }}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div style={{ margin: "10px", color: "blue" }}>Consigners today: {filteredConsigners.length}</div>
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

