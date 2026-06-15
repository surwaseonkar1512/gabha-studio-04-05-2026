import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay } from "swiper/modules";
import { Star } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

type Testimonial = {
  _id: string;
  name: string;
  message: string;
  rating: number;
  designation?: string;
  image?: string;
};

type Props = {
  testimonials: Testimonial[];
  backgroundImage?: string;
};

const TestimonialsSection = ({ testimonials }: Props) => {
  if (!testimonials.length) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="relative bg-white">
        {/* inline sculpture image — replace src with your actual asset */}
        <div className="absolute left-0 transform -translate-x-1/2 -z-10">
          <img src="/videosectionpng.png" alt="clay figures" />
        </div>
      </div>
      {/* Top Images */}
      <div className="max-w-[1200px] mx-auto flex flex-nowrap items-center justify-center gap-2 px-4">
        <img
          src="/testmonail1icon.png"
          alt=""
          aria-hidden
          className="h-[70px] sm:h-[90px] md:h-[120px] lg:h-[260px] w-auto object-contain shrink"
        />

        <img
          src="/testmonail.png"
          alt=""
          aria-hidden
          className="h-[20px] sm:h-[90px] md:h-[120px] lg:h-[260px] w-auto object-contain shrink"
        />

        <img
          src="/testmonail2icon.png"
          alt=""
          aria-hidden
          className="h-[70px] sm:h-[90px] md:h-[120px] lg:h-[260px] w-auto object-contain shrink"
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-12 px-4">
        <h2 className="font-tangerine text-2xl sm:text-3xl md:text-4xl text-black font-bold">
          Testimonials
        </h2>

        <p className="text-2xl sm:text-4xl md:text-5xl font-fraunces text-[#267C87]">
          Client Endorsements
        </p>
      </div>

      {/* Slider Section */}
      <div className="relative overflow-hidden rounded-3xl mx-4 sm:mx-8 lg:mx-16 py-12 sm:py-16">
        {/* Background */}
        <img
          src="/testbg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <Swiper
          modules={[Pagination, A11y, Autoplay]}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop
          className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20"
        >
          {testimonials.map((item: any) => {
            const name = item.name || item.clientName || "Anonymous";

            const message = item.message || item.review || "";

            const designation = item.designation || "Collector";

            const image = item.image;

            return (
              <SwiperSlide key={item._id}>
                <div className="w-[90%] sm:w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl px-4 sm:px-8 md:px-10 py-6 sm:py-10 text-center shadow-xl">
                  {" "}
                  <div className="flex justify-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < item.rating
                            ? "fill-[#C9A84C] text-[#C9A84C]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <h3 className="font-fraunces text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">
                    {designation}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-7 mb-8">
                    {message}
                  </p>
                  <div className="flex items-center justify-center gap-4 border-t border-zinc-200 pt-5">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 border border-zinc-300 flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-zinc-500 uppercase">
                          {name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="font-semibold text-zinc-900">{name}</p>

                      <p className="text-sm text-zinc-400">{designation}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
