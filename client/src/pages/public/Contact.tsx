import React, { useState, useEffect } from 'react';
import { Send, MapPin, Phone, Mail, Navigation } from 'lucide-react';
import api from '../../api/axiosInstance';

const Contact = () => {
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    productName: '',
    location: '',
    fullAddress: '',
    notesRequirements: '',
    latitude: '' as string | number,
    longitude: '' as string | number,
    locationType: 'Manual',
    source: 'Website Form'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/cms/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to load contact settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleGPSCapture = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Reverse geocoding via OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        })
          .then(res => res.json())
          .then(data => {
            let detectedLoc = '';
            if (data && data.address) {
              const addr = data.address;
              const parts = [
                addr.suburb || addr.neighbourhood || addr.village || addr.quarter || addr.subdivision,
                addr.city || addr.town || addr.municipality || addr.county,
                addr.state || addr.region
              ].filter(Boolean);
              if (parts.length > 0) {
                detectedLoc = parts.join(', ');
              } else if (data.display_name) {
                detectedLoc = data.display_name.split(',').slice(0, 3).join(',').trim();
              }
            }
            
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: 'GPS',
              location: detectedLoc || `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
              fullAddress: prev.fullAddress || data.display_name || ''
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
          })
          .catch(err => {
            console.error('Reverse geocoding error:', err);
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: 'GPS',
              location: prev.location || `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
          });
      },
      (error) => {
        console.error(error);
        alert('Could not retrieve your location. Please enter it manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Hits the public leads endpoint we created earlier
      await api.post('/leads/public', formData);
      setStatus('success');
      setFormData({ 
        name: '', 
        phone: '', 
        email: '', 
        productName: '',
        location: '',
        fullAddress: '',
        notesRequirements: '',
        latitude: '',
        longitude: '',
        locationType: 'Manual',
        source: 'Website Form' 
      });
      setGpsSuccess(false);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen">
       {/* Header */}
       <div className="bg-black py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase mb-4">
          Contact <span className="text-[#D4AF37]">Us</span>
        </h1>
        <div className="h-1 w-24 bg-[#990000] mx-auto"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-black uppercase tracking-widest mb-8">Get in Touch</h2>
            <p className="text-gray-600 mb-12 leading-relaxed">
              Whether you are looking to commission a custom sculpture or inquire about our existing collection, our team is ready to assist you.
            </p>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="h-6 w-6 text-[#990000]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">Visit Studio</h3>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                    {settings?.companyAddress || '123 Artisan District\nNew York, NY 10012'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">Call Us</h3>
                  <p className="text-gray-600 mt-1">
                    {settings?.phoneNumber || '+1 (555) 123-4567'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">Email Us</h3>
                  <p className="text-gray-600 mt-1">
                    {settings?.emailAddress || 'info@gabhastudio.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Send an Inquiry</h3>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 font-medium">
                Thank you! Your inquiry has been received. We will contact you shortly.
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 font-medium">
                There was an error sending your message. Please try again or call us.
              </div>
            )}

             <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Product/Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Art Portrait, Custom Sculpture commission"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-black">Customer Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, New York (City/Area)"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleGPSCapture}
                    disabled={gpsLoading}
                    className={`px-4 py-3 border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors ${gpsSuccess ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-black text-black hover:bg-black hover:text-white'}`}
                  >
                    <Navigation className={`h-4 w-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? 'Capturing...' : gpsSuccess ? 'GPS Saved' : 'Share GPS'}
                  </button>
                </div>
                {gpsSuccess && (
                  <p className="text-xs text-green-700 font-medium">
                    ✓ Live coordinates captured: {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Full Address</label>
                <textarea
                  rows={2}
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({...formData, fullAddress: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors resize-none"
                  placeholder="Street address, apartment, postal code..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Notes / Specific Requirements</label>
                <textarea
                  rows={3}
                  value={formData.notesRequirements}
                  onChange={(e) => setFormData({...formData, notesRequirements: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors resize-none"
                  placeholder="Tell us details about size, media preference, deadlines..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#990000] transition-colors disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending...' : <>Send Inquiry <Send className="ml-2 h-5 w-5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
