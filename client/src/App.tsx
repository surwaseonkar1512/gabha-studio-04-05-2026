import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from './store/store';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import LeadsList from './pages/crm/LeadsList';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/admin" />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="crm" element={<LeadsList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
