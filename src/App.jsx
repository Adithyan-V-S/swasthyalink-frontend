import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import About from './pages/about';
import PatientDashboard from './pages/patientdashboard';
import Footer from './components/footer';
import CursorTrail from './components/CursorTrail';
import Login from './pages/login';
import Register from './pages/register';

function App() {
  return (
    <Router>
      <CursorTrail />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/patientdashboard" element={<PatientDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
