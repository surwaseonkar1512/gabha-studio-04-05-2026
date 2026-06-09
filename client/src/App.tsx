import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from './store/store';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import LeadsList from './pages/crm/LeadsList';
import BookingsList from './pages/bookings/BookingsList';
import ExpensesList from './pages/finance/ExpensesList';
import QuotationModule from './pages/quotations/QuotationModule';
import QuotationMasterModule from './pages/quotations/QuotationMasterModule';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// CMS Pages
import CmsHub from './pages/cms/CmsHub';
import BannersModule from './pages/cms/BannersModule';
import AboutUsModule from './pages/cms/AboutUsModule';
import GalleryModule from './pages/cms/GalleryModule';
import CategoryModule from './pages/cms/CategoryModule';
import ProductModule from './pages/cms/ProductModule';
import InstagramModule from './pages/cms/InstagramModule';
import TestimonialsModule from './pages/cms/TestimonialsModule';
import SiteSettingsModule from './pages/cms/SiteSettingsModule';

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
          <Route path="quotations" element={<QuotationModule />} />
          <Route path="quotation-masters" element={<QuotationMasterModule />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="expenses" element={<ExpensesList />} />
          
          {/* CMS Submenu Routes */}
          <Route path="cms" element={<CmsHub />} />
          <Route path="cms/banners" element={<BannersModule />} />
          <Route path="cms/about" element={<AboutUsModule />} />
          <Route path="cms/gallery" element={<GalleryModule />} />
          <Route path="cms/categories" element={<CategoryModule />} />
          <Route path="cms/products" element={<ProductModule />} />
          <Route path="cms/instagram" element={<InstagramModule />} />
          <Route path="cms/testimonials" element={<TestimonialsModule />} />
          <Route path="cms/settings" element={<SiteSettingsModule />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
