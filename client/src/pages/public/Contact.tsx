import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import api from '../../api/axiosInstance';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    source: 'Website Form'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Hits the public leads endpoint we created earlier
      await api.post('/leads/public', formData);
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '', source: 'Website Form' });
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
                  <p className="text-gray-600 mt-1">123 Artisan District<br/>New York, NY 10012</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">Call Us</h3>
                  <p className="text-gray-600 mt-1">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">Email Us</h3>
                  <p className="text-gray-600 mt-1">info@gabhastudio.com</p>
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
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Full Name</label>
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
                  <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Email</label>
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
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#990000] transition-colors disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending...' : <>Send Message <Send className="ml-2 h-5 w-5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
