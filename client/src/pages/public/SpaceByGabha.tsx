import React, { useEffect, useState } from 'react';
import { RefreshCw, MapPin, ArrowRight, Sunrise, Sun, Sunset, Moon, Calendar, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axiosInstance';

interface CardItem {
  id?: number | string;
  title: string;
  image: string;
  items: string[];
  button_text: string;
  button_url: string;
  sort_order: number;
}

interface TimelineItem {
  id?: number | string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
}

interface GalleryItem {
  id?: number | string;
  image: string;
  alt: string;
}

interface SpaceData {
  page_name: string;
  slug: string;
  status: string;
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
  hero_section: {
    is_active: boolean;
    background_image: string;
    mobile_background_image: string;
    heading: string;
    subheading: string;
    location: string;
    cta_button: { text: string; url: string };
  };
  purpose_section: {
    is_active: boolean;
    heading: string;
    description: string;
    cards: CardItem[];
  };
  timeline_section: {
    is_active: boolean;
    heading: string;
    description: string;
    timeline_items: TimelineItem[];
  };
  nature_section: {
    is_active: boolean;
    heading: string;
    description: string;
    hero_image: string;
    gallery: GalleryItem[];
  };
  visit_section: {
    is_active: boolean;
    heading: string;
    description: string;
    cta_button: { text: string; url: string };
    location_info: {
      latitude: number;
      longitude: number;
      address_line_1: string;
      address_line_2: string;
      landmark: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    map: {
      provider: string;
      embed_url: string;
      location_name: string;
    };
  };
}

const getTimelineIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'sunrise':
      return <Sunrise className="h-6 w-6 text-[#9E7A68]" />;
    case 'sun':
      return <Sun className="h-6 w-6 text-[#9E7A68]" />;
    case 'sunset':
      return <Sunset className="h-6 w-6 text-[#9E7A68]" />;
    case 'moon':
      return <Moon className="h-6 w-6 text-[#9E7A68]" />;
    default:
      return <Sun className="h-6 w-6 text-[#9E7A68]" />;
  }
};

const ToolSketchSVG = () => (
  <svg viewBox="0 0 150 120" fill="none" stroke="#9E7A68" strokeWidth="1" className="w-36 h-28 opacity-80 shrink-0">
    {/* Sculpting Tool 1 */}
    <path d="M30 110 L65 30" />
    <path d="M63 34 C58 26, 68 20, 73 26 C78 32, 68 38, 63 34 Z" fill="#9E7A68" fillOpacity="0.1" />
    <path d="M28 114 C23 106, 33 100, 38 106 Z" fill="#9E7A68" fillOpacity="0.1" />

    {/* Sculpting Tool 2 */}
    <path d="M70 110 L85 20" strokeWidth="1.2" />
    <path d="M82 24 C76 14, 90 10, 93 18 C96 26, 88 30, 82 24 Z" fill="#9E7A68" fillOpacity="0.1" />
    <path d="M68 114 C62 104, 76 100, 79 108 Z" fill="#9E7A68" fillOpacity="0.1" />

    {/* Sculpting Tool 3 */}
    <path d="M110 110 L95 40" />
    <path d="M92 44 C88 36, 100 30, 103 38 C106 46, 98 48, 92 44 Z" fill="#9E7A68" fillOpacity="0.1" />
  </svg>
);

const SpaceByGabha = () => {
  const [data, setData] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await api.get('/cms/space-by-gabha');
        setData(res.data);
        if (res.data?.seo) {
          document.title = res.data.seo.meta_title || 'Space By Gabha';

          let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.getElementsByTagName('head')[0].appendChild(metaDesc);
          }
          metaDesc.content = res.data.seo.meta_description || '';
        }
      } catch (error) {
        console.error('Failed to load Space By Gabha content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <RefreshCw className="h-8 w-8 text-[#9E7A68] animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-zinc-800">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Space not found</h2>
          <p className="text-zinc-500 text-sm">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-zinc-900 font-sans overflow-x-hidden -mt-20">

      {/* 1. Hero Section */}
      {data.hero_section?.is_active && (
        <section className="relative min-h-[500px] sm:min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <picture className="w-full h-full">
              {data.hero_section.mobile_background_image && (
                <source media="(max-width: 640px)" srcSet={data.hero_section.mobile_background_image} />
              )}
              <img
                src={data.hero_section.background_image || '/sculpture_banner_bg.png'}
                alt={data.hero_section.heading}
                className="w-full h-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-black/25"></div>
            {/* White bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-white via-white/50 to-transparent z-10" />
          </div>

          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-6 mt-16">
            <h1 className="font-bodoni text-5xl sm:text-7xl lg:text-9xl font-light tracking-wide text-white drop-shadow-sm select-none">
              {data.hero_section.heading}
            </h1>

            {data.hero_section.cta_button?.text && (
              <div className="pt-2">
                <a
                  href={data.hero_section.cta_button.url}
                  className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/10 hover:bg-white hover:text-black px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 shadow-md"
                >
                  {data.hero_section.cta_button.text}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Purpose Section */}
      {data.purpose_section?.is_active && (
        <section id="explore" className="py-20 max-w-7xl mx-auto px-6 scroll-mt-20 space-y-12">
          {/* Header Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            <div className="md:col-span-4 text-left">
              <h2 className="font-bodoni text-4xl sm:text-5xl font-light tracking-wide text-zinc-900 leading-tight">
                Every Space
                <span className="block italic text-[#9E7A68] mt-1">Has A Purpose</span>
              </h2>
            </div>

            <div className="md:col-span-1 hidden md:block flex justify-center">
              <div className="h-20 w-[1px] bg-zinc-200" />
            </div>

            <div className="md:col-span-4 text-left">
              <p className="font-instrument-sans text-sm text-zinc-650 leading-relaxed font-light">
                {data.purpose_section.description}
              </p>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <ToolSketchSVG />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {data.purpose_section.cards?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((card, idx) => (
              <a
                href={card.button_url || '#'}
                key={card.id || idx}
                className="aspect-[3/4] rounded-[2rem] overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-zinc-100"
              >
                <img
                  src={card.image || '/sculpture_family_art.png'}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white text-left space-y-2">
                  <h3 className="font-bodoni text-3xl font-light tracking-wide">
                    {card.title}
                  </h3>
                  <p className="font-instrument-sans text-xs text-white/80 font-light leading-relaxed max-w-[90%]">
                    {card.items?.join(', ') || 'each event, paving the way for you to grow your holdings.'}
                  </p>
                  <div className="pt-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350 flex items-center text-xs font-semibold tracking-wider gap-1.5 text-white/95">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 3. Timeline Section */}
      {data.timeline_section?.is_active && (
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 transform -translate-x-1/3 translate-y-1/3 w-24 sm:w-36 md:w-48 lg:w-[220px] z-20 opacity-30 md:opacity-100 pointer-events-none">
            <img src="/sideroundPng.png" alt="clay figures" className="w-full h-auto" />
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">

              {/* Left Column Header with Abstract Blob */}
              <div className="lg:col-span-3 relative py-4">
                {/* Abstract shape */}

                <h2 className="font-bodoni text-4xl sm:text-5xl font-light text-zinc-900 leading-tight tracking-wide text-left">
                  A Space <br />
                  That Move <br />
                  With You
                </h2>
              </div>

              {/* Right Columns Grid */}
              <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.timeline_section.timeline_items?.map((item, idx) => (
                  <div key={item.id || idx} className="space-y-6 text-left flex flex-col justify-between h-full">
                    {/* Header Details */}
                    <div className="space-y-3">
                      {/* Divider & Icon */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="p-2 rounded-full bg-[#FDFBF9] border border-zinc-150 shadow-sm shrink-0">
                          {getTimelineIcon(item.icon)}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bodoni text-xl font-light text-zinc-800 tracking-wide">{item.title}</h4>
                        <p className="font-instrument-sans text-xs text-zinc-400 font-light mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Image Block */}
                    <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-50 mt-2">
                      <img
                        src={item.image || '/sculpture_family_art.png'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 4. Nature Section */}
      {data.nature_section?.is_active && (
        <section className="py-16 max-w-7xl mx-auto px-6 space-y-12">
          {/* Banner Card */}
          <div className="relative h-[360px] sm:h-[480px] rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100 flex items-center">
            <div className="absolute inset-0 z-0">
              <img
                src={data.nature_section.hero_image || '/sculptor_banner.png'}
                alt={data.nature_section.heading}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35"></div>
            </div>

            <div className="relative z-10 max-w-2xl px-8 sm:px-16 text-left text-white space-y-4">
              <h2 className="font-bodoni text-4xl sm:text-5xl font-light tracking-wide">
                {data.nature_section.heading}
              </h2>
              <p className="font-instrument-sans text-sm sm:text-base font-light text-white/95 leading-relaxed">
                {data.nature_section.description}
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          {data.nature_section.gallery?.length > 0 && (
            <div className="space-y-4 max-w-6xl mx-auto pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.nature_section.gallery.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="aspect-square rounded-[1.8rem] overflow-hidden bg-zinc-50 border border-zinc-100 group relative shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <img
                      src={item.image || '/sculpture_family_art.png'}
                      alt={item.alt || 'Gallery frame'}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-750"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <p className="text-[10px] text-white tracking-widest uppercase font-semibold">{item.alt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Visit Section */}
      {data.visit_section?.is_active && (
        <section className="py-16 bg-[#F8F6F1] border-t border-zinc-200/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

              {/* Column 1: Title & CTA Button */}
              <div className="md:col-span-4 space-y-6 text-left">
                <h2 className="font-bodoni text-4xl sm:text-5xl font-light text-zinc-900 leading-tight tracking-wide">
                  Visit <br />
                  The Space
                </h2>
                
                {data.visit_section.cta_button?.text && (
                  <div>
                    <a
                      href={data.visit_section.cta_button.url}
                      className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333333] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm"
                    >
                      {data.visit_section.cta_button.text}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Column 2: Address Info */}
              <div className="md:col-span-4 flex items-start gap-3 text-left">
                <MapPin className="h-5 w-5 text-zinc-800 shrink-0 mt-0.5" />
                <div className="font-instrument-sans text-xs sm:text-sm text-zinc-750 leading-relaxed space-y-1 font-light">
                  <p className="font-semibold text-zinc-900">{data.visit_section.map?.location_name || 'SPACE BY GABHA'}</p>
                  <p>{data.visit_section.location_info?.address_line_1}</p>
                  <p>{data.visit_section.location_info?.address_line_2}</p>
                  {data.visit_section.location_info?.landmark && (
                    <p>{data.visit_section.location_info.landmark}</p>
                  )}
                  <p>
                    {data.visit_section.location_info?.city} - {data.visit_section.location_info?.postal_code}
                  </p>
                </div>
              </div>

              {/* Column 3: Custom Map Sketch SVG Link */}
              <div className="md:col-span-4 flex justify-end">
                <a
                  href={data.visit_section.map?.embed_url || `https://maps.google.com/?q=${data.visit_section.location_info?.latitude || 18.6298},${data.visit_section.location_info?.longitude || 73.7997}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-sm aspect-[1.8/1] rounded-xl overflow-hidden border border-zinc-200/60 shadow-sm bg-[#F5EFEA] relative block group hover:shadow-md transition-shadow duration-300"
                >
                  {/* SVG Map Illustration */}
                  <svg className="w-full h-full" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="180" height="100" fill="#F4EFEA" />
                    
                    {/* Water body representing Kasarsai Dam */}
                    <path d="M140 100 C140 70, 160 65, 180 60 L180 100 Z" fill="#88A2B3" />
                    <path d="M145 100 C148 78, 163 70, 180 66" stroke="#9BB2C1" strokeWidth="1" />
                    
                    {/* Roads lines */}
                    <path d="M10 90 L120 15" stroke="#E2D7CD" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M60 53 L180 35" stroke="#E2D7CD" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M80 85 L140 10" stroke="#E2D7CD" strokeWidth="2.2" strokeLinecap="round" />
                    
                    {/* Pin location */}
                    <g transform="translate(115, 45)">
                      <circle cx="0" cy="0" r="10" fill="#1A1A1A" fillOpacity="0.04" />
                      <path d="M0 -7 C-3 -7 -5 -5 -5 -2 C-5 1.5 0 7 0 7 C0 7 5 1.5 5 -2 C5 -5 3 -7 0 -7 Z" fill="#1A1A1A" />
                      <circle cx="0" cy="-2" r="1.8" fill="#FFFFFF" />
                    </g>
                    
                    {/* Map Labels */}
                    <text x="125" y="42" fill="#1A1A1A" fontSize="5" fontFamily="Fraunces, serif" fontWeight="600" letterSpacing="0.4">SPACE</text>
                    <text x="125" y="48" fill="#1A1A1A" fontSize="5" fontFamily="Fraunces, serif" fontWeight="600" letterSpacing="0.4">BY GABHA</text>
                  </svg>
                </a>
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SpaceByGabha;
