import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Partners from './pages/Partners';
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
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FarmerOrdersPage from './pages/FarmerOrdersPage';
import MarketplaceLayout from './components/marketplace/MarketplaceLayout';
import FarmsPage from './pages/FarmsPage';
import FarmDetailsPage from './pages/FarmDetailsPage';
import FieldOperationsPage from './pages/FieldOperationsPage';
import ProducePage from './pages/ProducePage'; // New Checkout Page
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
import CommunityAdmin from './pages/admin/CommunityAdmin';

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
import CropKnowledge from './pages/CropKnowledge';
import PlantIdentificationPage from './pages/PlantIdentificationPage';
import AiRecommendationsPage from './pages/AiRecommendationsPage';
import PestPredictionPage from './pages/PestPredictionPage';
import MicroWeatherPage from './pages/MicroWeatherPage'; // New Feature
import CropRotationPage from './pages/CropRotationPage';
import CropCalendarPage from './pages/CropCalendarPage';
import DiseaseMapPage from './pages/DiseaseMapPage';
import DiseasePredictionPage from './pages/DiseasePredictionPage';
import SoilTestPage from './pages/SoilTestPage';
import IrrigationRLPage from './pages/IrrigationRLPage';
import ProcurePage from './pages/ProcurePage';
import YieldPredictionPage from './pages/YieldPredictionPage';
import ConsultationPage from './pages/ConsultationPage';
import SmartFarmingPage from './pages/SmartFarmingPage';
import FertilizerCalculatorPage from './pages/FertilizerCalculatorPage';
import ForumPage from './pages/ForumPage';
import QuestionDetail from './pages/QuestionDetail';
import WeatherAlertsPage from './pages/WeatherAlertsPage';

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
import OrderDetailsPage from './pages/OrderDetailsPage';
import SavedSuppliersPage from './pages/SavedSuppliersPage';
import NegotiationPage from './pages/NegotiationPage';
import NegotiationsListPage from './pages/NegotiationsListPage';


// Vendor imports
import VendorLayout from './components/vendor/VendorLayout';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorReviews from './pages/vendor/VendorReviews';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorPayments from './pages/vendor/VendorPayments';
import VendorNotifications from './pages/vendor/VendorNotifications';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorNegotiations from './pages/vendor/VendorNegotiations';
// VendorDashboard is reused as "My Products" for now
import MyProducts from './pages/VendorDashboard';
import VendorMarketTrends from './pages/vendor/VendorMarketTrends';


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
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/partners" element={<Partners />} />
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
                  <Route path="market-trends" element={<VendorMarketTrends />} />
                  <Route path="products" element={<MyProducts />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="negotiations" element={<VendorNegotiations />} />
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
                <Route path="/farmer/farms/:farmId/ai-recommendations" element={<PrivateRoute><AiRecommendationsPage /></PrivateRoute>} />
                <Route path="/pest-prediction" element={<PrivateRoute><PestPredictionPage /></PrivateRoute>} />

                {/* Community & Events */}
                <Route path="/community" element={<PrivateRoute><ForumPage /></PrivateRoute>} />
                <Route path="/community/question/:id" element={<PrivateRoute><QuestionDetail /></PrivateRoute>} />

                {/* Marketplace - Valid for both, logic inside */}
                <Route path="/marketplace" element={<PrivateRoute><MarketplaceLayout /></PrivateRoute>}>
                  <Route index element={<Marketplace />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="orders" element={<FarmerOrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailsPage />} />
                  <Route path="saved-suppliers" element={<SavedSuppliersPage />} />
                </Route>

                {/* Negotiation Routes */}
                <Route path="/negotiations" element={<PrivateRoute><NegotiationsListPage /></PrivateRoute>} />
                <Route path="/negotiations/:negotiationId" element={<PrivateRoute><NegotiationPage /></PrivateRoute>} />
                <Route path="/market-analytics" element={<PrivateRoute><MarketAnalyticsPage /></PrivateRoute>} />
                <Route path="/financial-services" element={<PrivateRoute><FinancialServicesPage /></PrivateRoute>} />

                <Route path="/feedback" element={<PrivateRoute><FeedbackCenter /></PrivateRoute>} />

                {/* Coming Soon / Placeholders */}
                <Route path="/crops/:id" element={<div className="container mt-5"><h2>Crop Detail Page (Coming Soon)</h2></div>} />
                <Route path="/disease-detection" element={<PrivateRoute><DiseasePredictionPage /></PrivateRoute>} />
                <Route path="/advisories" element={<PrivateRoute><ConsultationPage /></PrivateRoute>} />

                {/* Warehouse Module */}
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/warehouse/:id" element={<WarehouseDetailsPage />} />
                <Route path="/booking/request" element={<PrivateRoute><BookingRequestForm /></PrivateRoute>} />
                <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
                <Route path="/booking/:id" element={<PrivateRoute><BookingDetailsPage /></PrivateRoute>} />

                {/* Farm Management */}
                <Route path="/monitoring" element={<PrivateRoute><FarmMonitoringPage /></PrivateRoute>} />
                <Route path="/weather-alerts" element={<PrivateRoute><WeatherAlertsPage /></PrivateRoute>} />
                <Route path="/farm-management" element={<PrivateRoute><FarmManagement /></PrivateRoute>} />
                <Route path="/crop-knowledge" element={<PrivateRoute><CropKnowledge /></PrivateRoute>} />
                <Route path="/plant-doctor" element={<PrivateRoute><PlantIdentificationPage /></PrivateRoute>} />
                <Route path="/pest-prediction" element={<PrivateRoute><PestPredictionPage /></PrivateRoute>} />
                <Route path="/weather-intelligence" element={<PrivateRoute><MicroWeatherPage /></PrivateRoute>} />
                <Route path="/weather-intelligence" element={<PrivateRoute><MicroWeatherPage /></PrivateRoute>} />
                <Route path="/weather-intelligence" element={<PrivateRoute><MicroWeatherPage /></PrivateRoute>} />
                <Route path="/crop-rotation" element={<PrivateRoute><CropRotationPage /></PrivateRoute>} />
                <Route path="/farms" element={<PrivateRoute><FarmsPage /></PrivateRoute>} />
                <Route path="/farms/:id" element={<PrivateRoute><FarmDetailsPage /></PrivateRoute>} />
                <Route path="/field-operations" element={<PrivateRoute><FieldOperationsPage /></PrivateRoute>} />
                <Route path="/monitoring" element={<PrivateRoute><FarmMonitoringPage /></PrivateRoute>} />
                <Route path="/services/soil-test" element={<PrivateRoute><SoilTestPage /></PrivateRoute>} />
                <Route path="/rl-irrigation" element={<PrivateRoute><IrrigationRLPage /></PrivateRoute>} />
                <Route path="/procure" element={<PrivateRoute><ProcurePage /></PrivateRoute>} />
                <Route path="/yield-prediction" element={<PrivateRoute><YieldPredictionPage /></PrivateRoute>} />
                <Route path="/crop-calendar" element={<PrivateRoute><CropCalendarPage /></PrivateRoute>} />
                <Route path="/disease-map" element={<PrivateRoute><DiseaseMapPage /></PrivateRoute>} />
                <Route path="/smart-farming" element={<PrivateRoute><SmartFarmingPage /></PrivateRoute>} />
                <Route path="/fertilizer-calculator" element={<PrivateRoute><FertilizerCalculatorPage /></PrivateRoute>} />
                <Route path="/services/soil-test" element={<PrivateRoute><SoilTestPage /></PrivateRoute>} />
                <Route path="/rl-irrigation" element={<PrivateRoute><IrrigationRLPage /></PrivateRoute>} />
                <Route path="/procure" element={<PrivateRoute><ProcurePage /></PrivateRoute>} />
                <Route path="/yield-prediction" element={<PrivateRoute><YieldPredictionPage /></PrivateRoute>} />

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
                  <Route path="community" element={<CommunityAdmin />} />
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

