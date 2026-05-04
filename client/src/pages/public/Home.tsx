import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="/login-bg.png" 
            alt="Statue Art" 
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase mb-6">
            Masterpieces in <span className="text-[#D4AF37]">Stone</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gabha Studio crafts exceptional statues and sculptures that breathe life into space. Discover our premium collection.
          </p>
          <Link 
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Commission an Artwork <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-4">Featured Sculptures</h2>
            <div className="h-1 w-24 bg-[#D4AF37] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group relative overflow-hidden bg-gray-50 border border-gray-100">
                <div className="aspect-[3/4] bg-zinc-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  {/* Placeholder for actual statue images */}
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Star className="h-12 w-12" />
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-black uppercase tracking-wider mb-2">Eternity Figure {item}</h3>
                  <p className="text-[#990000] font-medium mb-4">Limited Edition</p>
                  <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-black border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors">
                    Inquire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aesthetic Banner */}
      <section className="py-24 bg-[#990000] text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-6">
            The Intersection of Passion and Precision
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Every curve, every texture is meticulously shaped by our master artisans to deliver absolute perfection.
          </p>
          <Link 
            to="/about"
            className="inline-block px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-[#990000] transition-colors"
          >
            Discover Our Story
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
