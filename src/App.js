import './App.css';
import Home from "./pages/home.js"
import DateView from "./pages/DateView.js"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchView from './pages/SearchView.js'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/date-view" element={<DateView />}/>
        <Route path="/search-view" element={<SearchView />}/>
      </Routes>
    </Router>
  );
}

export default App;
