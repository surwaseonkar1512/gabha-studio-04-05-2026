import React from "react";
import { Link } from "react-router-dom";

type AboutSectionProps = {
  aboutUs: any;
};

const AboutSection = ({ aboutUs }: AboutSectionProps) => (
  <section className="py-24 bg-zinc-50">
    <div className="max-w-full w-full  ">
      {aboutUs ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 justify-between">
          <div className="lg:col-span-3 flex items-center justify-center lg:justify-start">
            {aboutUs.leftImage && (
              <div className="w-full max-w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 -translate-y-6 hover:scale-[1.02] transition-transform duration-300">
                <img
                  src={aboutUs.leftImage}
                  alt="About artwork left"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-1 lg:px-6 text-center items-center justify-center">
            <h2 className="font-tangerine text-xl sm:text-3xl text-black font-bold ">
              {aboutUs.title}
            </h2>
            {aboutUs.subtitle && (
              <p className="text-2xl sm:text-4xl font-fraunces font-normal text-[#267C87]  ">
                {aboutUs.subtitle}
              </p>
            )}

            {aboutUs.description ? (
              <div className="prose prose-slate text-xl mt-3 sm:text-xl max-w-full flex items-center justify-center fo nt-instrument-sans text-black  space-y-4">
                <p className="w-[90%] text-normal">{aboutUs.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No details provided yet.</p>
            )}
          </div>

          <div className="lg:col-span-3 flex items-center justify-center lg:justify-start mt-14">
            {aboutUs.rightImage && (
              <div className="w-full max-w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 translate-y-6 hover:scale-[1.02] transition-transform duration-300">
                <img
                  src={aboutUs.rightImage}
                  alt="About artwork right"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-black">
            A Legacy of Stone
          </h2>
          <div className="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Founded in the heart of the artisan district, Gabha Studio began
            with a singular vision: to craft sculptures that transcend time.
          </p>
          <Link
            to="/about"
            className="inline-block text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-[#D4AF37]"
          >
            Learn more
          </Link>
        </div>
      )}
    </div>
  </section>
);

export default AboutSection;
