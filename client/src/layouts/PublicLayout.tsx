import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Palette, Menu, X } from 'lucide-react';
import api from '../api/axiosInstance';

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<any>(null);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/cms/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      if (settings.metaTitle) {
        document.title = settings.metaTitle;
      }
      if (settings.favicon) {
        const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settings.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      if (settings.metaDescription) {
        let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'description';
          document.getElementsByTagName('head')[0].appendChild(meta);
        }
        meta.content = settings.metaDescription;
      }
    }
  }, [settings]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-black">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {settings?.navbarLogo ? (
                <img src={settings.navbarLogo} alt={settings.websiteName || "Gabha Studio"} className="h-12 w-auto object-contain" />
              ) : (
                <>
                  <Palette className="h-8 w-8 text-[#D4AF37]" />
                  <span className="text-2xl font-bold tracking-widest uppercase">{settings?.websiteName || 'Gabha Studio'}</span>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm tracking-widest uppercase font-medium transition-colors hover:text-[#D4AF37] ${
                    isActive(link.path) ? 'text-[#D4AF37]' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="ml-8 px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors text-sm tracking-widest uppercase font-bold"
              >
                Client Portal
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium uppercase tracking-wider ${
                    isActive(link.path) ? 'text-[#D4AF37] bg-black' : 'text-gray-300 hover:text-white hover:bg-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block mt-4 px-3 py-3 rounded-md text-base font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37] text-center"
              >
                Client Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings?.footerLogo ? (
                <img src={settings.footerLogo} alt={settings.websiteName || "Gabha Studio"} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Palette className="h-6 w-6 text-[#D4AF37]" />
                  <span className="text-xl font-bold tracking-widest uppercase">{settings?.websiteName || 'Gabha Studio'}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings?.footerText || 'Crafting timeless statues and sculptures that capture the essence of pure art. Elevate your space with our masterpieces.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 text-[#D4AF37]">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 text-[#D4AF37]">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{settings?.emailAddress || 'info@gabhastudio.com'}</li>
              <li>{settings?.phoneNumber || '+1 (555) 123-4567'}</li>
              <li>{settings?.companyAddress || 'Artisan District, New York, NY'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-800 text-center text-gray-500 text-xs tracking-wider">
          {settings?.copyrightText || `© ${new Date().getFullYear()} ${settings?.websiteName || 'Gabha Studio'}. All rights reserved.`}
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
