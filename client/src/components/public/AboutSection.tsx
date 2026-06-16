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
    <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-zinc-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="w-full grid grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center justify-center">
          
          {/* Center Text Section */}
          <div className="col-span-2 lg:col-span-6 text-center space-y-4 sm:space-y-6 px-2 sm:px-4 order-1 lg:order-2">
            <h2 className="font-tangerine text-4xl sm:text-5xl lg:text-6xl text-zinc-800 font-semibold tracking-wide">
              {aboutUs?.title || "About Us"}
            </h2>

            <p className="text-xl sm:text-2xl lg:text-3xl font-fraunces font-medium text-[#1e606b] leading-tight max-w-xl mx-auto">
              {aboutUs?.subtitle ||
                "The Art of Clay Sculptures: Where Imagination Takes Shape"}
            </p>

            <div className="font-instrument-sans text-zinc-700 text-sm sm:text-base lg:text-[18px] leading-relaxed max-w-xl mx-auto space-y-3 sm:space-y-4">
              {paragraphs.map((p: string, idx: number) => (
                <p key={idx} className="font-normal text-zinc-600">
                  {p.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Left Floating Image */}
          <div className="col-span-1 lg:col-span-3 flex justify-end lg:justify-center order-2 lg:order-1 mt-4 lg:mt-0">
            <div className="w-[125px] sm:w-[170px] md:w-[210px] lg:w-full lg:max-w-[280px] aspect-[4/5] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl border border-zinc-100 hover:scale-[1.02] transition-transform duration-300">
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

          {/* Right Floating Image */}
          <div className="col-span-1 lg:col-span-3 flex justify-start lg:justify-center order-3 lg:order-3 mt-4 lg:mt-0">
            <div className="w-[125px] sm:w-[170px] md:w-[210px] lg:w-full lg:max-w-[280px] aspect-[4/5] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl border border-zinc-100 hover:scale-[1.02] transition-transform duration-300">
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
