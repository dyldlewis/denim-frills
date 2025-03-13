import React, { useState, useEffect } from 'react';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Checkbox from '@mui/joy/Checkbox';
import ButtonGroup from '@mui/joy/ButtonGroup';
import { Link } from 'react-router-dom';

export default function Home() {
  // Styling Objects
  const addConsignerStyle = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    alignItems: 'center',
    textAlign: 'center',
    margin: "10px",
    gap: '10px'
  };

  const listTitlesStyle = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: '60px 100px 100px 100px 100px 100px 300px',
    alignItems: 'center',
    textAlign: 'center',
    margin: "10px",
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '5px'
  };

  const consignerListStyle = {
    display: 'grid',
    justifyContent: 'space-evenly',
    gridTemplateColumns: '60px 100px 100px 100px 100px 100px 300px',
    alignItems: 'center',
    textAlign: 'center',
    margin: '10px',
    padding: '10px',
    border: 'solid grey 1px',
    borderRadius: '5px',
    gap: '10px'
  };

  const bannerStyle = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: "30px",
    flexWrap: 'wrap'
  };

  // Helper Functions
  function displayDonate(donate) {
    if (donate === true) {
      return <h3 style={{ color: "green" }}>Donate</h3>;
    }
    if (donate === false) {
      return <h3 style={{ color: "red" }}>Take back</h3>;
    }
    return null;
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

  // Helper function to format buyout amount
  function formatBuyoutAmount(amount) {
    if (amount === null || amount === undefined) return "";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return "";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  }

  // State Variables
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bags, setBags] = useState("");
  const [isDonate, setIsDonate] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [consigners, setConsigners] = useState([]);

  // For editing consigners
  const [editMode, setEditMode] = useState({});
  const [editedConsigners, setEditedConsigners] = useState({});

  useEffect(() => {
    fetchConsigners();
  }, []);

  // Fetch All Consigners
  async function fetchConsigners() {
    try {
      const response = await fetch('http://localhost:8080/consigners');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Ensure buyout_amount is a number and is_buyout is boolean
      const processedData = data.map(consigner => ({
        ...consigner,
        buyout_amount: consigners.buyout_amount !== null ? Number(consigner.buyout_amount) : null,
        is_buyout: consigners.is_buyout !== null ? Boolean(consigner.is_buyout) : false,
      }));

      setConsigners(processedData);
    } catch (error) {
      console.error('Error fetching consigners:', error);
    }
  }

  // Add New Consigner
  async function addNewConsigner() {
    try {
      const response = await fetch('http://localhost:8080/consigners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, bags, isDonate, is_new: isNew })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error adding consigner: ${errorText}`);
      }
      // After adding, refetch the list
      fetchConsigners();
      // Clear form
      setName("");
      setPhone("");
      setBags("");
      setIsDonate(false);
      setIsNew(false);
    } catch (error) {
      console.error('Error adding consigner:', error);
    }
  }
  function printConsigner(consigner) {
    console.log(consigner)
    var isNew = "false"
    var isDonate = "false"
    
    if (consigner.is_new === true) {
      isNew = "true"   
    }

    if (consigner.is_donate === true) {
      isDonate = "true"
    } 
    // Create a small print window
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return; // If popup is blocked, just return

    // Write minimal HTML for the tag
    printWindow.document.write(`
      <html>
        <head>
          <title>Consigner Tag</title>
          <style>
            /* Styles to make the tag smaller */
            body {
              margin: 0;
              padding: 10px;
              font-family: sans-serif;
              font-size: 14px;
            }
            .tag {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 10px;
              width: 200px;
              margin: auto;
              text-align: left;
            }
            .tag p {
              margin: 4px 0;
            }
            @media print {
              /* This hides the default browser header/footer if allowed by the browser */
              @page { margin: 0; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="tag">
            <p><strong>Name:</strong> ${consigner.name}</p>
            <p><strong>Phone:</strong> ${consigner.phone}</p>
            <p><strong>New?: ${isNew}</p>
            <p><strong>Donate?: ${isDonate}</p>
          </div>
          <script>
  setTimeout(() => {
    window.print();
  }, 100); 

          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
  // Update Consigner
  async function updateConsigner(id, fields) {
    try {
      // Ensure that fields is not empty
      if (Object.keys(fields).length === 0) {
        throw new Error('No fields to update');
      }

      console.log(`Updating Consigner ID: ${id} with fields:`, fields);

      const response = await fetch(`http://localhost:8080/consigners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error updating consigner: ${errorText}`);
      }

      fetchConsigners();
    } catch (error) {
      console.error('Error updating consigner:', error);
      alert(`Failed to update consigner: ${error.message}`);
    }
  }

  // Start Editing
  function startEditing(ex) {
    setEditMode((prev) => ({ ...prev, [ex.id]: true }));
    setEditedConsigners((prev) => ({
      ...prev,
      [ex.id]: {
        name: ex.name,
        phone: ex.phone,
        bags: ex.bags,
        isDonate: ex.is_donate,
        is_buyout: ex.is_buyout,
        buyout_amount: ex.buyout_amount,
        took_nothing: ex.took_nothing,
        number: ex.number,
      }
    }));
  }

  // Cancel Editing
  function cancelEditing(id) {
    setEditMode((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setEditedConsigners((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }

  // Save Editing
  async function saveEditing(id) {
    const edited = editedConsigners[id];
    // Validate fields if necessary
    await updateConsigner(id, {
      name: edited.name,
      phone: edited.phone,
      bags: edited.bags,
      is_donate: edited.isDonate,
      is_buyout: edited.is_buyout,
      buyout_amount: edited.buyout_amount,
      took_nothing: edited.took_nothing,
      number: edited.number,
      is_new: edited.is_new,
    });
    cancelEditing(id);
  }

  // Handle Field Change during Editing
  function handleFieldChange(id, field, value) {
    setEditedConsigners((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  }

  // Handle Inline Number Change (Display Mode)
  async function handleInlineNumberChange(id, value) {
    let parsedNumber = value === "" ? null : parseInt(value, 10);
    if (value !== "" && isNaN(parsedNumber)) {
      alert('Please enter a valid number.');
      return;
    }
    await updateConsigner(id, { number: parsedNumber });
  }

  // Handle Inline Buyout Amount Change (Display Mode)
  async function handleInlineBuyoutChange(id, value) {
    let parsedBuyout;

    if (typeof value === 'string') {
      parsedBuyout = value.trim() === "" ? null : parseFloat(value);
    } else if (typeof value === 'number') {
      parsedBuyout = value;
    } else {
      parsedBuyout = null;
    }

    if (value !== "" && isNaN(parsedBuyout)) {
      alert('Please enter a valid buyout amount.');
      return;
    }

    await updateConsigner(id, { buyout_amount: parsedBuyout });
  }

  // Handle Checkbox Toggles with Consolidated PUT Requests
  const handleCheckboxToggle = async (id, field, value) => {
    const updatedFields = { [field]: value };

    if (field === 'is_buyout') {
      if (value) {
        updatedFields.took_nothing = false;
        updatedFields.number = null;
      } else {
        updatedFields.buyout_amount = null;
      }
    }

    if (field === 'took_nothing' && value) {
      updatedFields.is_buyout = false;
      updatedFields.buyout_amount = null;
      updatedFields.number = null;
    }

    await updateConsigner(id, updatedFields);
  };

  // Filter consigners to only show those from today
  const todaysConsigners = consigners.filter(ex => isToday(ex.created_at));

  // Apply the search filter to today's consigners
  const filteredConsigners = todaysConsigners.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.phone.includes(searchQuery)
  );

  function totalBuyout(todaysConsigners) {
    var total = 0;
    for (var i = 0; i < todaysConsigners.length; i++) {
      total += todaysConsigners[i].buyout_amount
    }
    return total
  }


  return (
    <div>
      {/* Banner with Navigation */}
      <div style={bannerStyle}>
        <h1>Denim & Frills Consigners</h1>
        <ButtonGroup>
          <Button>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Home
            </Link>
          </Button>
          <Button>
            <Link to="/date-view" style={{ textDecoration: 'none', color: 'inherit' }}>
              Date View
            </Link>
          </Button>
          <Button>
            <Link to="/search-view" style={{ textDecoration: 'none', color: 'inherit' }}>
              Name Search
            </Link>
          </Button>
        </ButtonGroup>
      </div>

      {/* Add Consigner Form */}
      <div style={addConsignerStyle}>
        <Input
          color="primary"
          variant="outlined"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", height: "40px" }}
        />
        <Input
          color="primary"
          variant="outlined"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", height: "40px" }}
        />
        <Input
          color="primary"
          variant="outlined"
          placeholder="Bags"
          value={bags}
          onChange={(e) => setBags(e.target.value)}
          style={{ width: "100%", height: "40px" }}
        />
        <div style={{ display: "flex" }}>
          {/* Donate Checkbox */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              color="success"
              size="lg"
              variant="outlined"
              checked={isDonate}
              onChange={() => setIsDonate(!isDonate)}
            />
            <h4>Donate</h4>
          </div>
          {/* New Checkbox */}
          <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", }}>
            <Checkbox
              color="primary"
              size="lg"
              variant="outlined"
              checked={isNew}
              onChange={() => setIsNew(!isNew)}
            />
            <h4>New</h4>
          </div>
        </div>
        {/* Submit Button */}
        <Button variant="solid" onClick={addNewConsigner}>Submit</Button>
      </div>

      {/* List Titles */}
      <div style={listTitlesStyle}>
        <h2 style={{ margin: "10px", color: "blue" }}>Info:</h2>
        <h2>Time</h2>
        <h2>Name</h2>
        <h2>Phone</h2>
        <h2>Bags</h2>
        <h2>Donate</h2>
        <h2>Number/Buyout</h2>
      </div>

      {/* Search Input */}

      {/* Daily Consigner Count */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <Input
          color="primary"
          variant="outlined"
          placeholder="Search by Name or Phone"
          style={{ width: "400px", height: "40px", marginLeft: "10px" }}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ margin: "10px", color: "blue" }}>Consigners today: {filteredConsigners.length}</div>
        <div style={{ margin: "10px", color: "green" }}>Buyouts total: ${totalBuyout(todaysConsigners)}</div>
      </div>

      {/* Consigners List */}
      <div>
        {filteredConsigners.map((ex) => {
          const isEditingConsigner = editMode[ex.id];
          const edited = editedConsigners[ex.id] || {};
          const tookNothing = isEditingConsigner ? edited.took_nothing : ex.took_nothing;
          const buyoutChecked = isEditingConsigner ? edited.is_buyout : (ex.is_buyout || ex.buyout_amount ? true : false);
          const buyoutAmount = isEditingConsigner ? edited.buyout_amount : ex.buyout_amount;
          const numberVal = isEditingConsigner ? edited.number : ex.number;

          return (
            <div key={ex.id} style={consignerListStyle}>
              {/* Action Buttons */}
              <div>
                {isEditingConsigner ? (
                  <div style={{ display: "flex" }}>
                    <Button
                      variant="solid"
                      style={{ width: "60px", marginRight: "5px" }}
                      onClick={() => saveEditing(ex.id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="solid"
                      style={{ width: "60px" }}
                      onClick={() => cancelEditing(ex.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : null}
                {/* Edit Button */}
                {!isEditingConsigner && (
                  <Button
                    variant="soft"
                    onClick={() => startEditing(ex)}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="soft"
                  onClick={() => printConsigner(ex)}
                  style={{ marginLeft: "10px", marginTop: "10px"}}
                >
                  Print
                </Button>
              </div>

              {/* Time */}
              <h3>{formatTimestamp(ex.created_at)}</h3>

              {/* Name */}
              {isEditingConsigner ? (
                <Input
                  color="primary"
                  variant="outlined"
                  value={edited.name}
                  onChange={(e) => handleFieldChange(ex.id, 'name', e.target.value)}
                  style={{ width: "100%", height: "40px" }}
                />
              ) : (

                <h3>
                  {ex.name} {ex.is_new && <span style={{ color: "purple" }}>New</span>}
                </h3>
              )}

              {/* Phone */}
              {isEditingConsigner ? (
                <Input
                  color="primary"
                  variant="outlined"
                  value={edited.phone}
                  onChange={(e) => handleFieldChange(ex.id, 'phone', e.target.value)}
                  style={{ width: "100%", height: "40px" }}
                />
              ) : (
                <h3>{ex.phone}</h3>
              )}

              {/* Bags */}
              {isEditingConsigner ? (
                <Input
                  color="primary"
                  variant="outlined"
                  value={edited.bags}
                  onChange={(e) => handleFieldChange(ex.id, 'bags', e.target.value)}
                  style={{ width: "100%", height: "40px" }}
                />
              ) : (
                <h3>{ex.bags}</h3>
              )}

              {/* Donate */}
              {isEditingConsigner ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Checkbox
                    color="success"
                    size="lg"
                    variant="outlined"
                    checked={edited.isDonate}
                    onChange={() => handleFieldChange(ex.id, 'isDonate', !edited.isDonate)}
                  />
                  <span>Donate</span>
                </div>
              ) : (
                displayDonate(ex.is_donate)
              )}

              {/* Took Nothing and Buyout Checkboxes with Conditional Inputs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {/* Took Nothing Checkbox */}
                {!buyoutChecked && (
                  <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <Checkbox
                      checked={tookNothing || false}
                      onChange={(e) => {
                        const newVal = e.target.checked;
                        handleCheckboxToggle(ex.id, 'took_nothing', newVal);
                      }}
                      color="neutral"
                      size="lg"
                      variant="outlined"
                    />
                    <span style={{ textAlign: "left" }}>Took Nothing</span>
                  </div>
                )}

                {/* Buyout Checkbox */}
                {!tookNothing && (
                  <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <Checkbox
                      checked={buyoutChecked || false}
                      onChange={(e) => {
                        const newVal = e.target.checked;
                        handleCheckboxToggle(ex.id, 'is_buyout', newVal);
                      }}
                      color="neutral"
                      size="lg"
                      variant="outlined"
                    />
                    <span>Buyout</span>
                  </div>
                )}

                {/* Number Input and Submit Button */}
                {!tookNothing && !buyoutChecked && (
                  <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <Input
                      color="primary"
                      variant="outlined"
                      placeholder="Number..."
                      value={numberVal || ""}
                      onChange={(e) => handleInlineNumberChange(ex.id, e.target.value)}
                      style={{ width: "80px", height: "40px", marginRight: "10px" }}
                    />
                    <Button
                      variant="solid"
                      onClick={() => handleInlineNumberChange(ex.id, numberVal)}
                    >
                      Submit
                    </Button>
                  </div>
                )}

                {/* Buyout Amount Input and Submit Button */}
                {buyoutChecked && (
                  <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <div style={{ color: "blue" }}>$</div>
                    <Input
                      color="primary"
                      variant="outlined"
                      placeholder="Buyout Amount"
                      value={buyoutAmount !== null && buyoutAmount !== undefined ? formatBuyoutAmount(buyoutAmount) : ""}
                      onChange={(e) => handleInlineBuyoutChange(ex.id, e.target.value)}
                      style={{ width: "120px", height: "40px", marginRight: "10px" }}
                    />
                    <Button
                      variant="solid"
                      onClick={() => handleInlineBuyoutChange(ex.id, buyoutAmount)}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>



            </div>
          );
        })}
      </div>
    </div>
  );
}

