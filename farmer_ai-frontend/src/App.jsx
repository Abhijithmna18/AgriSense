import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
// Pages (Lazy load or direct import)
import ProfileSettings from './pages/ProfileSettings';


// ... (Rest of imports)

// Inside Routes
// ...



import Recommendations from './pages/Recommendations';
import AddFarmPage from './pages/AddFarmPage';
import Marketplace from './pages/Marketplace'; // Marketplace Home
import MarketplaceLayout from './components/marketplace/MarketplaceLayout';
import CartPage from './pages/CartPage';
import FarmerOrdersPage from './pages/FarmerOrdersPage';
import CheckoutPage from './pages/CheckoutPage'; // New Checkout Page
import FinancialServicesPage from './pages/FinancialServicesPage';
import PrivateRoute from './components/PrivateRoute';

// Admin Pages
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

import AdminLoanQueue from './pages/admin/loan/AdminLoanQueue';
import LoanReviewPage from './pages/admin/loan/LoanReviewPage';

// Warehouse Pages
import Warehouses from './pages/Warehouses';
import WarehouseDetailsPage from './pages/WarehouseDetailsPage';
import FeedbackCenter from './pages/FeedbackCenter';
import BookingRequestForm from './pages/BookingRequestForm';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import FarmMonitoringPage from './pages/FarmMonitoringPage';
import FarmManagement from './pages/FarmManagement';

// Admin Warehouse Pages
import AdminWarehousePage from './pages/admin/AdminWarehousePage';
import AdminBookingRequestsPage from './pages/admin/AdminBookingRequestsPage';
import AdminWarehouseReportsPage from './pages/admin/AdminWarehouseReportsPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';

// Admin Homepage Editor
import HeroEditor from './pages/admin/homepage/HeroEditor';
import FeaturesEditor from './pages/admin/homepage/FeaturesEditor';
import PerformanceEditor from './pages/admin/homepage/PerformanceEditor';
import MarketplaceEditor from './pages/admin/homepage/MarketplaceEditor';
import FooterEditor from './pages/admin/homepage/FooterEditor';

import VendorDashboard from './pages/VendorDashboard';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import MarketAnalyticsPage from './pages/MarketAnalyticsPage';


// Vendor imports
import VendorLayout from './components/vendor/VendorLayout';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorReviews from './pages/vendor/VendorReviews';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorPayments from './pages/vendor/VendorPayments';
import VendorNotifications from './pages/vendor/VendorNotifications';
import VendorProfile from './pages/vendor/VendorProfile';
// VendorDashboard is reused as "My Products" for now
import MyProducts from './pages/VendorDashboard';


// ... existing imports ...
import VendorRegister from './pages/VendorRegister';
import AdminVendorApproval from './pages/admin/AdminVendorApproval';
function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<Verify />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Vendor Registration */}
                <Route path="/sell" element={<VendorRegister />} />

                {/* Vendor Portal */}
                <Route path="/vendor-dashboard" element={<Navigate to="/vendor/dashboard" replace />} />
                <Route path="/vendor" element={<PrivateRoute><VendorLayout /></PrivateRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<VendorAnalytics />} />
                  <Route path="products" element={<MyProducts />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="reviews" element={<VendorReviews />} />
                  <Route path="analytics" element={<VendorAnalytics />} />
                  <Route path="payments" element={<VendorPayments />} />
                  <Route path="notifications" element={<VendorNotifications />} />
                  <Route path="profile" element={<VendorProfile />} />
                </Route>

                {/* Dashboard Routes */}
                <Route path="/farmer-dashboard" element={<PrivateRoute><Dashboard expectedRole="farmer" /></PrivateRoute>} />
                <Route path="/buyer-dashboard" element={<PrivateRoute><Dashboard expectedRole="buyer" /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><BuyerOrdersPage /></PrivateRoute>} />
                <Route path="/dashboard" element={<Navigate to="/farmer-dashboard" replace />} />

                {/* Secure Modules */}
                <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
                <Route path="/profile-settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
                <Route path="/farms/new" element={<PrivateRoute><AddFarmPage /></PrivateRoute>} />

                {/* Marketplace - Valid for both, logic inside */}
                <Route path="/marketplace" element={<PrivateRoute><MarketplaceLayout /></PrivateRoute>}>
                  <Route index element={<Marketplace />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="orders" element={<FarmerOrdersPage />} />
                  {/* Add order details route if needed later */}
                  <Route path="orders/:id" element={<div className="p-8">Order Details Coming Soon</div>} />
                </Route>
                <Route path="/market-analytics" element={<PrivateRoute><MarketAnalyticsPage /></PrivateRoute>} />
                <Route path="/financial-services" element={<PrivateRoute><FinancialServicesPage /></PrivateRoute>} />

                <Route path="/feedback" element={<PrivateRoute><FeedbackCenter /></PrivateRoute>} />

                {/* Coming Soon / Placeholders */}
                <Route path="/crops/:id" element={<div className="container mt-5"><h2>Crop Detail Page (Coming Soon)</h2></div>} />
                <Route path="/disease-detection" element={<div className="container mt-5"><h2>Disease Detection Page (Coming Soon)</h2></div>} />
                <Route path="/advisories" element={<div className="container mt-5"><h2>Advisories Page (Coming Soon)</h2></div>} />

                {/* Warehouse Module */}
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/warehouse/:id" element={<WarehouseDetailsPage />} />
                <Route path="/booking/request" element={<PrivateRoute><BookingRequestForm /></PrivateRoute>} />
                <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
                <Route path="/booking/:id" element={<PrivateRoute><BookingDetailsPage /></PrivateRoute>} />

                {/* Farm Management */}
                <Route path="/monitoring" element={<PrivateRoute><FarmMonitoringPage /></PrivateRoute>} />
                <Route path="/farm-management" element={<PrivateRoute><FarmManagement /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UsersAdmin />} />
                  <Route path="vendors" element={<AdminVendorApproval />} />
                  <Route path="farms" element={<FarmsAdmin />} />
                  <Route path="marketplace" element={<MarketplaceAdmin />} />
                  <Route path="recommendations" element={<RecommendationsAdmin />} />
                  <Route path="feature-flags" element={<FeatureFlagsAdmin />} />
                  <Route path="roles" element={<RolesPermissionsAdmin />} />
                  <Route path="audit" element={<AuditLogsAdmin />} />
                  <Route path="settings" element={<SettingsAdmin />} />
                  <Route path="loans" element={<AdminLoanQueue />} />
                  <Route path="loans/:id" element={<LoanReviewPage />} />

                  {/* Warehouse Admin */}
                  <Route path="warehouses" element={<AdminWarehousePage />} />
                  <Route path="warehouse-requests" element={<AdminBookingRequestsPage />} />
                  <Route path="warehouse-reports" element={<AdminWarehouseReportsPage />} />
                  <Route path="feedback" element={<AdminFeedbackPage />} />

                  {/* CMS */}
                  <Route path="homepage/hero" element={<HeroEditor />} />
                  <Route path="homepage/features" element={<FeaturesEditor />} />
                  <Route path="homepage/performance" element={<PerformanceEditor />} />
                  <Route path="homepage/marketplace" element={<MarketplaceEditor />} />
                  <Route path="homepage/footer" element={<FooterEditor />} />
                  <Route path="*" element={<div className="text-white">Admin Page Not Found</div>} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<div className="p-10 text-center"><h1>404 - Page Not Found</h1></div>} />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </DataProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </ThemeProvider>
  );
}

export default App;

