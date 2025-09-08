import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Components
import Header from './components/header';
import Footer from './components/footer';
import CursorTrail from './components/CursorTrail';
import Loader from './components/Loader';
// import Chatbot from './components/Chatbot';
import GeminiChatbot from './components/GeminiChatbot';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/home';
import About from './pages/about';
import PatientDashboard from './pages/patientdashboard';
import DoctorDashboard from './pages/doctordashboard';
import AdminDashboard from './pages/admindashboard';
import FamilyDashboard from './pages/familydashboard';
import UpdatedFamilyDashboard from './pages/UpdatedFamilyDashboard';
import Settings from './pages/settings';
import Login from './pages/login';
import Register from './pages/register';

function AppContent() {
  const location = useLocation();
  const hideHeaderFooterOn = ['/login', '/register', '/admindashboard'];

  return (
    <ErrorBoundary>
      {/* <CursorTrail /> */}
      {!hideHeaderFooterOn.includes(location.pathname) && <Header />}
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* Authentication Routes - Redirect if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Protected Routes - Authentication required */}
        <Route path="/patientdashboard" element={<PrivateRoute requiredRole="patient"><PatientDashboard /></PrivateRoute>} />
        <Route path="/doctordashboard" element={<PrivateRoute requiredRole="doctor"><DoctorDashboard /></PrivateRoute>} />
        <Route path="/admindashboard" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/familydashboard" element={<PrivateRoute requiredRole="family"><UpdatedFamilyDashboard /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      </Routes>
      {!hideHeaderFooterOn.includes(location.pathname) && <Footer />}
      {/* <Chatbot /> */}
      <GeminiChatbot />
    </ErrorBoundary>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
