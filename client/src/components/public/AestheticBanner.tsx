import React from "react";
import { Link } from "react-router-dom";

const AestheticBanner = () => (
  <section className="py-24 bg-[#990000] text-white text-center px-4 relative overflow-hidden">
    <div className="max-w-3xl mx-auto space-y-6 relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest leading-tight">
        The Intersection of Passion and Precision
      </h2>
      <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
        Every curve, every texture is meticulously shaped by our master artisans
        to deliver absolute perfection.
      </p>
      {/* <div className="pt-4">
                <Link
                    to="/about"
                    className="inline-block px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-[#990000] transition-colors text-sm shadow-md hover:shadow-lg"
                >
                    Discover Our Story
                </Link>
            </div> */}
    </div>
  </section>
);

export default AestheticBanner;
