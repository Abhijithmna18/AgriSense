import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersAdmin from './pages/admin/UsersAdmin';
import FeatureFlagsAdmin from './pages/admin/FeatureFlagsAdmin';
import AuditLogsAdmin from './pages/admin/AuditLogsAdmin';
import FarmsAdmin from './pages/admin/FarmsAdmin';
import MarketplaceAdmin from './pages/admin/MarketplaceAdmin';
import RecommendationsAdmin from './pages/admin/RecommendationsAdmin';
import RolesPermissionsAdmin from './pages/admin/RolesPermissionsAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import { Navigate } from 'react-router-dom';

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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <PrivateRoute>
                    <Recommendations />
                  </PrivateRoute>
                }
              />
              <Route path="/crops/:id" element={<div className="container mt-5"><h2>Crop Detail Page (Coming Soon)</h2></div>} />
              <Route path="/disease-detection" element={<div className="container mt-5"><h2>Disease Detection Page (Coming Soon)</h2></div>} />
              <Route path="/marketplace" element={<div className="container mt-5"><h2>Marketplace Page (Coming Soon)</h2></div>} />
              <Route path="/advisories" element={<div className="container mt-5"><h2>Advisories Page (Coming Soon)</h2></div>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="farms" element={<FarmsAdmin />} />
                <Route path="marketplace" element={<MarketplaceAdmin />} />
                <Route path="recommendations" element={<RecommendationsAdmin />} />
                <Route path="feature-flags" element={<FeatureFlagsAdmin />} />
                <Route path="roles" element={<RolesPermissionsAdmin />} />
                <Route path="audit" element={<AuditLogsAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
                <Route path="*" element={<div className="text-white">Admin Page Not Found</div>} />
              </Route>
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
