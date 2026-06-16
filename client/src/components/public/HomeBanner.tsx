import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axiosInstance';

type HomeBannerProps = {
    banners: any[];
    currentSlide: number;
    setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
};

const HomeBanner = ({ banners, currentSlide, setCurrentSlide }: HomeBannerProps) => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/cms/settings');
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            if (settings.metaTitle) {
                document.title = settings.metaTitle;
            }
            if (settings.favicon) {
                const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = settings.favicon;
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            if (settings.metaDescription) {
                let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'description';
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
                meta.content = settings.metaDescription;
            }
        }
    }, [settings]);

    return (
        <section className="relative h-screen bg-zinc-950 overflow-hidden text-white">

            {banners.length > 0 ? (
                <div className="absolute inset-0 w-full h-full">
                    {banners.map((banner, index) => (
                        <div
                            key={banner._id}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <picture className="absolute inset-0 w-full h-full">
                                {banner.mobileBannerImage && (
                                    <source media="(max-width: 640px)" srcSet={banner.mobileBannerImage} />
                                )}
                                <img
                                    src={banner.bannerImage && !banner.bannerImage.includes('default') ? banner.bannerImage : '/sculpture_banner_bg.png'}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                            </picture>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>

                            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                                <div className="relative mx-auto max-w-5xl">
                                    {banner.title === 'Timeless Sculptures' || !banner.title ? (
                                        <h1 className="font-fraunces text-[clamp(65px,7vw,120px)] md:text-[clamp(90px,10vw,170px)] leading-[0.9] uppercase tracking-[-0.01em] drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] flex flex-col md:flex-row items-center justify-center gap-x-6">
                                            <span className="flex">
                                                <span className="text-white">T</span>
                                                <span className="text-white">i</span>
                                                <span className="text-white">m</span>
                                                <span className="text-outline">e</span>
                                                <span className="text-outline">l</span>
                                                <span className="text-outline">e</span>
                                                <span className="text-outline">s</span>
                                                <span className="text-outline">s</span>
                                            </span>
                                            <span className="flex">
                                                <span className="text-outline">S</span>
                                                <span className="text-outline">c</span>
                                                <span className="text-outline">u</span>
                                                <span className="text-outline">l</span>
                                                <span className="text-white">p</span>
                                                <span className="text-white">t</span>
                                                <span className="text-white">u</span>
                                                <span className="text-outline">r</span>
                                                <span className="text-outline">e</span>
                                                <span className="text-outline">s</span>
                                            </span>
                                        </h1>
                                    ) : (
                                        <h1 className="font-fraunces text-outline text-[clamp(90px,10vw,170px)] leading-[0.9] uppercase tracking-[-0.01em] drop-shadow-[0_24px_45px_rgba(0,0,0,0.25)]"
                                            style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.95)', mixBlendMode: 'screen' }}
                                        >
                                            {banner.title}
                                        </h1>
                                    )}
                                    {banner.ctaText && (
                                        <div className="mt-8">
                                            <Link
                                                to={banner.ctaLink || '/contact'}
                                                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-xl transition duration-300 hover:shadow-2xl"
                                            >
                                                {banner.ctaText} <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                    <div className="absolute inset-0 opacity-40">
                        <img src="/login-bg.png" alt="Statue Art" className="w-full h-full object-cover mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
                    </div>
                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase">
                            Masterpieces in <span className="text-[#D4AF37]">Stone</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Gabha Studio crafts exceptional statues and sculptures that breathe life into space. Discover our premium collection.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            Commission an Artwork <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            )}
        </section>
    );
};

export default HomeBanner;
