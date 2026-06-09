import React, { useEffect, useState } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import api from '../../api/axiosInstance';

const About = () => {
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await api.get('/cms/about');
        setAboutUs(data);
      } catch (error) {
        console.error('Failed to load About page details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <RefreshCw className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-black py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase mb-4">
          Our <span className="text-[#D4AF37]">Story</span>
        </h1>
        <div className="h-1 w-24 bg-[#990000] mx-auto"></div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="aspect-square bg-zinc-100 border border-zinc-200 relative p-4">
              <div className="w-full h-full border border-[#D4AF37] p-4">
                <img
                  src={aboutUs?.leftImage || aboutUs?.rightImage || "/login-bg.png"}
                  alt={aboutUs?.title || "Studio artwork"}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-6">
              {aboutUs?.title || 'A Legacy of Stone'}
            </h2>
            
            {aboutUs?.subtitle && (
              <p className="text-[#990000] font-bold uppercase tracking-widest text-xs mb-4">
                {aboutUs.subtitle}
              </p>
            )}

            {aboutUs?.description ? (
              <div
                dangerouslySetInnerHTML={{ __html: aboutUs.description }}
                className="prose dark:prose-invert max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8"
              />
            ) : (
              <>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Founded in the heart of the artisan district, Gabha Studio began with a singular vision: to craft sculptures that transcend time. Our masterful artists combine centuries-old chiseling techniques with modern conceptual design to create statues that speak to the soul.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  We source only the finest marble, bronze, and modern composites, ensuring that every piece is not just an artwork, but an heirloom.
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
              <div>
                <p className="text-4xl font-bold text-[#990000] mb-2">50+</p>
                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Masterpieces</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-[#D4AF37] mb-2">15</p>
                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Years of Art</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
