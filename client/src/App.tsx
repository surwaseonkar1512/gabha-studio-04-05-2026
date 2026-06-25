import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from './store/store';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import LeadsList from './pages/crm/LeadsList';
import BookingsList from './pages/bookings/BookingsList';
import ExpensesList from './pages/finance/ExpensesList';
import QuotationMasterModule from './pages/quotations/QuotationMasterModule';
import ContactsList from './pages/crm/ContactsList';
import NewsletterList from './pages/crm/NewsletterList';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Artwork from './pages/public/Artwork';
import ProductDetails from './pages/public/ProductDetails';
import Gallery from './pages/public/Gallery';
import SpaceByGabha from './pages/public/SpaceByGabha';

// CMS Pages
import CmsHub from './pages/cms/CmsHub';
import BannersModule from './pages/cms/BannersModule';
import SpaceByGabhaModule from './pages/cms/SpaceByGabhaModule';
import AboutUsModule from './pages/cms/AboutUsModule';
import GalleryModule from './pages/cms/GalleryModule';
import CategoryModule from './pages/cms/CategoryModule';
import ProductModule from './pages/cms/ProductModule';
import InstagramModule from './pages/cms/InstagramModule';
import TestimonialsModule from './pages/cms/TestimonialsModule';
import SiteSettingsModule from './pages/cms/SiteSettingsModule';
import CustomersList from './pages/crm/CustomersList';

// RBAC & User Management Pages
import ForceChangePassword from './pages/auth/ForceChangePassword';
import UserProfile from './pages/profile/UserProfile';
import EmployeesList from './pages/employees/EmployeesList';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/artwork" element={<Artwork />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/space-by-gabha" element={<SpaceByGabha />} />
        </Route>

        {/* Auth Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/admin" />} />

        {/* Force Password Reset Route */}
        <Route path="/change-password" element={isAuthenticated ? <ForceChangePassword /> : <Navigate to="/login" />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="crm" element={<LeadsList />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="newsletter" element={<NewsletterList />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="quotations" element={<QuotationMasterModule />} />
          <Route path="quotation-masters" element={<QuotationMasterModule />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="expenses" element={<ExpensesList />} />
          <Route path="employees" element={<EmployeesList />} />
          <Route path="profile" element={<UserProfile />} />

          {/* CMS Submenu Routes */}
          <Route path="cms" element={<CmsHub />} />
          <Route path="cms/banners" element={<BannersModule />} />
          <Route path="cms/space-by-gabha" element={<SpaceByGabhaModule />} />
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
