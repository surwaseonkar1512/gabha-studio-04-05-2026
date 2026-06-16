import React from "react";
import { Link } from "react-router-dom";
import AppointmentSection from "../components/public/AppointmentSection";

type Props = {
  navLinks: { name: string; path: string }[];
  settings: {
    footerLogo?: string;
    websiteName?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    whatsAppNumber?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  };
};

const Footer = (props: Props) => {
  const { navLinks, settings } = props;

  const socialLinks = [
    {
      img: "/instagram.png",
      href: settings?.instagramUrl || "#",
      label: "Instagram",
      bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    },
    {
      img: "/facebook.png",
      href: settings?.facebookUrl || "#",
      label: "Facebook",
      bg: "bg-[#1877F2]",
    },
    {
      img: "/youtube.png",
      href: settings?.youtubeUrl || "#",
      label: "YouTube",
      bg: "bg-[#FF0000]",
    },
  ].filter((s) => s.href && s.href !== "#");

  return (
    <footer className="relative w-full overflow-visible mt-20 ">
      {/* Background image (uses public/footerbg.png) */}
      <div
        className="w-full absolute inset-0 bg-right-bottom mt-[140px]  bg-cover"
        style={{ backgroundImage: "url('/footerbg.png')" }}
      />

      {/* Appointment section (above footer content) */}

      {/* Main row: form+links left, image right */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start gap-8 relative w-full">
          {/* Left: form + links */}
          <div className="w-full md:w-1/2 bg-transparent">
            <div className="bg-[#91684A] rounded-2xl px-8 py-10 shadow-xl max-w-md">
              <h2
                className="text-white text-3xl sm:text-4xl mb-3 leading-snug"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Let's get started
              </h2>
              <p className="text-white/85 text-sm sm:text-base mb-6 leading-relaxed">
                Clayz ceramics bring a soulful charm — every piece feels
                personal.
              </p>
              <div className="flex rounded-lg overflow-hidden shadow-sm">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white text-gray-800 placeholder-gray-400"
                />
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap">
                  Submit
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-5">
                {settings?.footerLogo ? (
                  <img
                    src={settings.footerLogo}
                    alt={settings?.websiteName ?? "Logo"}
                    className="h-12 object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="black"
                    >
                      <polygon points="12,2 22,22 2,22" />
                    </svg>
                    <span className="text-xs tracking-widest text-black uppercase font-semibold">
                      {settings?.websiteName ?? "CAPITA"}
                    </span>
                  </div>
                )}
              </div>

              <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                {(navLinks?.length
                  ? navLinks
                  : [
                      { name: "Home", path: "/" },
                      { name: "Artwork", path: "/artwork" },
                      { name: "Gallery", path: "/gallery" },
                      { name: "Our Story", path: "/our-story" },
                      { name: "Start a project", path: "/start" },
                    ]
                ).map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-800 text-sm hover:text-black hover:underline underline-offset-2 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="flex gap-3">
                {socialLinks.map(({ img, href, label, bg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`${bg} w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden`}
                  >
                    <img
                      src={img}
                      alt={label}
                      className="w-5 h-5 object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="w-full md:absolute md:inset-y-0 md:right-0 md:-mt-32 flex items-center justify-center md:justify-end z-20 pointer-events-none mt-8 md:mt-0">
            <img
              src="/FooterImg.png"
              alt="Decoration"
              className="w-[220px] sm:w-[260px] md:w-[280px] lg:w-[380px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 border-t border-black/10 text-center py-4 text-xs text-gray-500 bg-transparent">
        © {new Date().getFullYear()} {settings?.websiteName ?? "Clayz Ceramics"}
        . All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
