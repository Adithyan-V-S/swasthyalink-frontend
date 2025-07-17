import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import About from './pages/about';
import PatientDashboard from './pages/patientdashboard';
import DoctorDashboard from './pages/doctordashboard';
import Settings from './pages/settings';
import Footer from './components/footer';
import CursorTrail from './components/CursorTrail';
import Login from './pages/login';
import Register from './pages/register';
import { useEffect, useState } from 'react';
import Loader from './components/Loader';
import Chatbot from './components/Chatbot';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <CursorTrail />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/patientdashboard" element={<PatientDashboard />} />
        <Route path="/doctordashboard" element={<DoctorDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
      <Chatbot />
    </Router>
  );
}

export default App;
