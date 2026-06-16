import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

type SwiperGalleryProps = {
    galleries: any[];
    activeGalleryTab: string;
    setActiveGalleryTab: (value: string) => void;
};

const SwiperGallery = ({
    galleries,
    activeGalleryTab,
    setActiveGalleryTab,
}: SwiperGalleryProps) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const activeGallery = galleries.find(
        (gallery) => gallery._id === activeGalleryTab,
    );

    if (galleries.length === 0 || !activeGallery) return null;

    const images = activeGallery.images ?? [];
    const loopImages =
        images.length < 10 ? [...images, ...images, ...images] : images;

    return (
        <section className="py-4 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <style>{`
                    .gallery-swiper {
                        padding: 20px 0 10px !important;
                        overflow: hidden !important;
                    }
                    @media (min-width: 768px) {
                        .gallery-swiper {
                            padding: 40px 0 20px !important;
                        }
                    }
                    .gallery-swiper .swiper-slide {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .gallery-swiper .swiper-wrapper {
                        overflow: visible;
                    }
                    .gallery-swiper .swiper-slide {
                        width: auto;
                    }
                    .gallery-swiper .slide-inner {
                        width: 100%;
                        border-radius: 2rem;
                        overflow: hidden;
                        border: 1.5px solid rgba(255,255,255,0.4);
                        // box-shadow: 0 8px 32px rgba(0,0,0,0.14);
                        transition:
                            transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            box-shadow 0.5s ease,
                            opacity 0.5s ease;
                    }
                    .gallery-swiper .swiper-slide-active .slide-inner {
                        transform: rotate(0deg) translateY(0px) scale(1.0);
                        // box-shadow: 0 20px 60px rgba(0,0,0,0.22);
                        opacity: 1;
                    }
                    .gallery-swiper .swiper-slide-prev .slide-inner {
                        transform: rotate(-6deg) translateY(16px) scale(0.93);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.10);
                        opacity: 1;
                    }
                    .gallery-swiper .swiper-slide-next .slide-inner {
                        transform: rotate(6deg) translateY(16px) scale(0.93);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.10);
                        opacity: 1;
                    }
                    .gallery-swiper .swiper-slide:not(.swiper-slide-active):not(.swiper-slide-prev):not(.swiper-slide-next) .slide-inner {
                        transform: rotate(9deg) translateY(22px) scale(0.87);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                        opacity: 0.5;
                    }

                    /* Tagline section */
                    .tagline-section {
                        position: relative;
                        overflow: hidden;
                        background: #faf9f7;
                        border-top: 1px solid #ebe8e2;
                        padding: 48px 0;
                    }
                    .tagline-inner {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-wrap: nowrap;
                        gap: 10px 12px;
                        text-align: center;
                        max-width: 100%;
                        margin: 0 auto;
                        padding: 0 24px;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    .tagline-inner::-webkit-scrollbar {
                        display: none;
                    }
                    .tagline-word {
                        font-family: 'Georgia', serif;
                        font-size: clamp(1.5rem, 3vw, 2.2rem);
                        font-weight: 400;
                        color: #1a1a1a;
                        line-height: 1.3;
                        letter-spacing: -0.01em;
                    }
                    .tagline-img {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        vertical-align: middle;
                    }
                    .tagline-img img {
                        height: 56px;
                        width: auto;
                        object-fit: contain;
                        border-radius: 8px;
                    }
                    .tagline-accent {
                        display: inline-flex;
                        align-items: center;
                        gap: 2px;
                    }
                    .tagline-accent span {
                        display: block;
                        width: 18px;
                        height: 18px;
                        background: #D4AF37;
                        clip-path: polygon(0 50%, 60% 0, 60% 35%, 100% 35%, 100% 65%, 60% 65%, 60% 100%);
                    }

                    /* pink blob decoration */
                    .tagline-blob {
                        position: absolute;
                        left: -40px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 120px;
                        height: 120px;
                        background: #f2c4b8;
                        border-radius: 50% 50% 50% 30% / 50% 50% 30% 50%;
                        opacity: 0.5;
                        pointer-events: none;
                    }
                `}</style>

                {/* Swiper */}
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={1.5}
                    centeredSlides
                    spaceBetween={16}
                    breakpoints={{
                        640: {
                            slidesPerView: 2.5,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3.5,
                            spaceBetween: 24,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 24,
                        },
                    }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    speed={500}
                    loop
                    loopAdditionalSlides={5}
                    watchSlidesProgress
                    onSwiper={(swiper: any) => {
                        swiperRef.current = swiper;
                        setTimeout(() => {
                            swiper.loopFix();
                            swiper.autoplay.start();
                        }, 100);
                    }}
                    className="gallery-swiper"
                >
                    {loopImages.map((image: any, index: number) => (
                        <SwiperSlide key={`${image.url}-${index}`}>
                            <div className="slide-inner">
                                <img
                                    src={image.url}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-[220px] sm:h-[320px] md:h-[400px] object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Static Tagline Section */}


                {/* </div> */}
            </div>
            <div className="w-full overflow-hidden mt-6 lg:mt-12">
                <div className="flex justify-center items-center mt-4 sm:mt-6">
                    {/* inline sculpture image — scale content properly on mobile */}
                    <div className="h-auto max-w-[280px] sm:max-w-[450px] md:max-w-none">
                        <img src="/gallarybelowimage.png" alt="clay figures" className="max-w-full h-auto object-contain" />
                    </div>
                </div>
            </div>

            {/* inline round sculpture graphic — positioned at the bottom to overflow/flow onto the Gabha component below */}
            <div className="absolute bottom-0 left-0 transform -translate-x-1/3 translate-y-1/3 w-24 sm:w-36 md:w-48 lg:w-[220px] z-20 opacity-30 md:opacity-100 pointer-events-none">
                <img src="/sideroundPng.png" alt="clay figures" className="w-full h-auto" />
            </div>
        </section>
    );
};

export default SwiperGallery;
