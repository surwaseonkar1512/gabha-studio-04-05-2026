import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Palette, Menu, X, Smartphone } from "lucide-react";
import api from "../api/axiosInstance";
import Footer from "./Footer";

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<any>(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Artwork", path: "/artwork" },
    { name: "Gallery", path: "/gallery" },
    { name: "Our Story", path: "/about" },
    { name: "Start a project", path: "/contact" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/cms/settings");
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings", error);
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
        const link =
          (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = settings.favicon;
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      if (settings.metaDescription) {
        let meta = document.querySelector(
          "meta[name='description']",
        ) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.getElementsByTagName("head")[0].appendChild(meta);
        }
        meta.content = settings.metaDescription;
      }
    }
  }, [settings]);

  const isActive = (path: string) => location.pathname === path;
  const isLightHeader =
    location.pathname === "/artwork" ||
    location.pathname === "/gallery" ||
    location.pathname === "/contact" ||
    location.pathname.startsWith("/product/");

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent text-white">
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-200 border-b ${isLightHeader ? "bg-white/95 border-zinc-200/80 shadow-sm text-zinc-900" : "border-white/5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 font-sans">
              {settings?.navbarLogo || settings?.websiteLogo ? (
                <img
                  src={settings?.navbarLogo || settings?.websiteLogo}
                  alt={settings?.websiteName || "Gabha Studio"}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-2">
                  <svg
                    className="h-14 w-auto"
                    viewBox="0 0 120 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polygon
                      points="60,5 110,80 10,80"
                      stroke={isLightHeader ? "black" : "white"}
                      strokeWidth="2"
                      fill="none"
                    />
                    <text
                      x="60"
                      y="66"
                      fill={isLightHeader ? "black" : "white"}
                      fontSize="16"
                      fontFamily="Fraunces, serif"
                      fontWeight="600"
                      textAnchor="middle"
                      letterSpacing="4"
                    >
                      GABHA
                    </text>
                    <text
                      x="60"
                      y="93"
                      fill={isLightHeader ? "#666" : "white"}
                      fontSize="8"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      letterSpacing="3"
                    >
                      STUDIO
                    </text>
                  </svg>
                </div>
              )}
            </Link>

            <nav className={`hidden md:flex items-center gap-8 text-sm tracking-[0.2em] ${isLightHeader ? "text-zinc-700" : "text-white/95"}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors duration-200 ${isActive(link.path) ? (isLightHeader ? "text-black font-semibold" : "text-white font-semibold") : (isLightHeader ? "hover:text-black" : "hover:text-white")}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/contact"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition shadow-lg ${isLightHeader ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"}`}
              >
                <Smartphone className={`h-4.5 w-4.5 ${isLightHeader ? "text-white" : "text-black"}`} />
                Contact Us
              </Link>
            </div>

            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-full border p-2 md:hidden ${isLightHeader ? "border-zinc-200 bg-white/80 text-zinc-800" : "border-white/20 bg-black/30 text-white"}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className={`md:hidden border-t backdrop-blur-xl ${isLightHeader ? "border-zinc-200 bg-white/95 text-zinc-900 shadow-lg" : "border-white/10 bg-black/80"}`}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-base uppercase tracking-[0.2em] ${isLightHeader ? "text-zinc-700 hover:text-black" : "text-white/90 hover:text-white"}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`inline-flex items-center justify-center w-full gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold ${isLightHeader ? "bg-black text-white" : "bg-white text-black"}`}
              >
                <Smartphone className="h-4.5 w-4.5" />
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer navLinks={navLinks} settings={settings} />
    </div>
  );
};

export default PublicLayout;
