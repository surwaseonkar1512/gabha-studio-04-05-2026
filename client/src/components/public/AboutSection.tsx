import React from "react";
import { Link } from "react-router-dom";

type AboutSectionProps = {
  aboutUs: any;
};

const AboutSection = ({ aboutUs }: AboutSectionProps) => {
  const descriptionText =
    aboutUs?.description ||
    "A sculpture is more than art; it is a silent conversation between the artist’s vision and the beauty created from something as simple and natural as clay.\nThrough clay, artists give shape to dreams, preserve emotions, and create masterpieces";

  const paragraphs = descriptionText.split("\n").filter(Boolean);

  return (
    <section className="py-24 bg-white border-b border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Floating Image */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="w-full max-w-[280px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl border border-zinc-100 hover:scale-[1.02] transition-transform duration-300">
              <img
                src={
                  aboutUs?.leftImage && !aboutUs.leftImage.includes("default")
                    ? aboutUs.leftImage
                    : "/about_clay_face.png"
                }
                alt="About artwork left"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Center Text Section */}
          <div className="lg:col-span-6 text-center space-y-6 px-4">
            <h2 className="font-tangerine text-5xl sm:text-6xl text-zinc-800 font-semibold tracking-wide">
              {aboutUs?.title || "About Us"}
            </h2>

            <p className="text-2xl sm:text-3xl font-fraunces font-medium text-[#1e606b] leading-tight max-w-xl mx-auto">
              {aboutUs?.subtitle ||
                "The Art of Clay Sculptures: Where Imagination Takes Shape"}
            </p>

            <div className="font-instrument-sans text-zinc-700 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto space-y-4">
              {paragraphs.map((p: string, idx: number) => (
                <p key={idx} className="font-normal text-zinc-600">
                  {p.trim()}
                </p>
              ))}
            </div>

            {/* {aboutUs?.ctaText && (
              <div className="pt-2">
                <Link
                  to={aboutUs.ctaLink || "/about"}
                  className="inline-block text-sm font-bold uppercase tracking-widest border-b-2 border-zinc-800 pb-1 text-zinc-800 hover:text-[#1e606b] hover:border-[#1e606b] transition-colors"
                >
                  {aboutUs.ctaText}
                </Link>
              </div>
            )} */}
          </div>

          {/* Right Floating Image */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="w-full max-w-[280px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl border border-zinc-100 hover:scale-[1.02] transition-transform duration-300">
              <img
                src={
                  aboutUs?.rightImage && !aboutUs.rightImage.includes("default")
                    ? aboutUs.rightImage
                    : "/about_sculpting_tools.png"
                }
                alt="About artwork right"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
