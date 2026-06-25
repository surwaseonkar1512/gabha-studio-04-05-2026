import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../api/axiosInstance';

interface JourneyMilestone {
  _id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

const About = () => {
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, journeyRes] = await Promise.all([
          api.get('/cms/about'),
          api.get('/cms/journey')
        ]);
        setAboutUs(aboutRes.data);
        // Filter active milestones
        const activeMilestones = journeyRes.data.filter((m: any) => m.isActive);
        setMilestones(activeMilestones);
      } catch (error) {
        console.error('Failed to load Our Story details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <RefreshCw className="h-8 w-8 text-[#9E7A68] animate-spin" />
      </div>
    );
  }

  // Fallback static milestones matching the user's design if none are loaded from the database
  const displayMilestones = milestones.length > 0 ? milestones : [
    {
      _id: 'default-1',
      year: '2002',
      title: 'The Beginning',
      description: 'Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.',
      image: '/about_sculpting_tools.png',
      displayOrder: 0,
      isActive: true
    },
    {
      _id: 'default-2',
      year: '2006',
      title: 'Exploring Creativity',
      description: 'Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.',
      image: '/about_clay_face.png',
      displayOrder: 1,
      isActive: true
    },
    {
      _id: 'default-3',
      year: '2012',
      title: 'The Beginning',
      description: 'Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.',
      image: '/appointment_sculpting.png',
      displayOrder: 2,
      isActive: true
    },
    {
      _id: 'default-4',
      year: '2024',
      title: 'Exploring Creativity',
      description: 'Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.',
      image: '/sculpture_banner_bg.png',
      displayOrder: 3,
      isActive: true
    }
  ];

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      {/* SECTION 1: Hero Banner */}
      <section 
        className="relative min-h-[260px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center bg-cover bg-center overflow-visible"
        style={{ backgroundImage: "url('/deer_sculpture_story.png')" }}
      >
        {/* Black tint overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* White bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-white via-white/40 to-transparent z-10" />

        {/* Content text */}
        <div className="relative z-20 text-center px-4">
          <h1 className="font-bodoni text-4xl sm:text-7xl lg:text-9xl font-light text-white tracking-wider drop-shadow-sm select-none">
            Our Story
          </h1>
        </div>
      </section>

      {/* SECTION 2: Subheading introduction */}
      <section className="py-12 text-center bg-white px-4 sm:px-6 relative z-20">
        <p className="font-serif italic text-[#9E7A68] text-sm sm:text-base mb-2">
          {aboutUs?.subtitle || "Our Story"}
        </p>
        <h2 className="font-bodoni text-2xl sm:text-3xl lg:text-4xl text-[#2C3D52] font-normal tracking-wide max-w-2xl mx-auto leading-relaxed">
          {aboutUs?.title || "Crafting timeless clay art with passion and creativity."}
        </h2>
      </section>

      {/* SECTION 3: Alternating timeline journey */}
      <section className="py-16 bg-white relative overflow-hidden px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative">
          
          {/* Vertical Center Strip (Desktop) */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[70px] bg-[#DEECF4]/60 -z-10" />

          {/* Vertical Left Strip (Mobile) */}
          <div className="block md:hidden absolute top-0 bottom-0 left-[35px] w-[50px] bg-[#DEECF4]/60 -z-10" />

          {/* Timeline Milestones list */}
          <div className="space-y-16 md:space-y-28 relative z-10">
            {displayMilestones.map((m, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={m._id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
                >
                  {isEven ? (
                    <>
                      {/* Image (left on desktop, top on mobile) */}
                      <div className="md:col-span-6 flex justify-start md:justify-end order-1 md:order-1 pl-[70px] md:pl-0">
                        <div className="w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-zinc-100 bg-white group">
                          <img 
                            src={m.image || '/sculpture_family_art.png'} 
                            alt={m.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" 
                          />
                        </div>
                      </div>

                      {/* Text (right on desktop, bottom on mobile) */}
                      <div className="md:col-span-5 md:col-start-8 text-left order-2 md:order-2 px-4 pl-[70px] md:pl-4">
                        <h3 className="font-serif text-[#9E7A68] text-lg sm:text-xl lg:text-2xl font-light mb-2">
                          {m.title}
                        </h3>
                        <p className="text-zinc-500 font-sans text-xs sm:text-sm leading-relaxed mb-4 font-light">
                          {m.description}
                        </p>
                        <div className="select-none leading-none">
                          <span 
                            className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-wide text-transparent font-bodoni"
                            style={{ WebkitTextStroke: "1px #1A1A1A" }}
                          >
                            {m.year}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Text (left on desktop, bottom on mobile) - right aligned on desktop, left on mobile */}
                      <div className="md:col-span-5 md:col-start-1 text-left md:text-right order-2 md:order-1 px-4 pl-[70px] md:pl-4">
                        <h3 className="font-serif text-[#9E7A68] text-lg sm:text-xl lg:text-2xl font-light mb-2">
                          {m.title}
                        </h3>
                        <p className="text-zinc-500 font-sans text-xs sm:text-sm leading-relaxed mb-4 font-light">
                          {m.description}
                        </p>
                        <div className="select-none leading-none">
                          <span 
                            className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-wide text-transparent font-bodoni"
                            style={{ WebkitTextStroke: "1px #1A1A1A" }}
                          >
                            {m.year}
                          </span>
                        </div>
                      </div>

                      {/* Image (right on desktop, top on mobile) */}
                      <div className="md:col-span-6 md:col-start-7 flex justify-start order-1 md:order-2 pl-[70px] md:pl-0">
                        <div className="w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-zinc-100 bg-white group">
                          <img 
                            src={m.image || '/sculpture_family_art.png'} 
                            alt={m.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" 
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
