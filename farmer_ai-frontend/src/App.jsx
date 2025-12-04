import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/crops/:id" element={<div className="container mt-5"><h2>Crop Detail Page (Coming Soon)</h2></div>} />
              <Route path="/disease-detection" element={<div className="container mt-5"><h2>Disease Detection Page (Coming Soon)</h2></div>} />
              <Route path="/marketplace" element={<div className="container mt-5"><h2>Marketplace Page (Coming Soon)</h2></div>} />
              <Route path="/advisories" element={<div className="container mt-5"><h2>Advisories Page (Coming Soon)</h2></div>} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
