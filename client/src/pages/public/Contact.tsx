import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, MapPin, Phone, Mail, Navigation, } from "lucide-react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import AppointmentSection from "../../components/public/AppointmentSection";

const Contact = () => {
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    productName: "",
    location: "",
    fullAddress: "",
    notesRequirements: "",
    latitude: "" as string | number,
    longitude: "" as string | number,
    locationType: "Manual",
    source: "Website Form",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [emailSub, setEmailSub] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/cms/settings");
        setSettings(data);
      } catch (error) {
        console.error("Failed to load contact settings", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub) return;
    toast.success("Thank you for subscribing to our updates!");
    setEmailSub("");
  };

  const handleGPSCapture = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocoding via OpenStreetMap Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
          {
            headers: { "Accept-Language": "en" },
          },
        )
          .then((res) => res.json())
          .then((data) => {
            let detectedLoc = "";
            if (data && data.address) {
              const addr = data.address;
              const parts = [
                addr.suburb ||
                addr.neighbourhood ||
                addr.village ||
                addr.quarter ||
                addr.subdivision,
                addr.city || addr.town || addr.municipality || addr.county,
                addr.state || addr.region,
              ].filter(Boolean);
              if (parts.length > 0) {
                detectedLoc = parts.join(", ");
              } else if (data.display_name) {
                detectedLoc = data.display_name
                  .split(",")
                  .slice(0, 3)
                  .join(",")
                  .trim();
              }
            }

            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: "GPS",
              location:
                detectedLoc ||
                `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
              fullAddress: prev.fullAddress || data.display_name || "",
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
          })
          .catch((err) => {
            console.error("Reverse geocoding error:", err);
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: "GPS",
              location:
                prev.location ||
                `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
          });
      },
      (error) => {
        console.error(error);
        toast.error("Could not retrieve your location. Please enter it manually.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/contacts/public", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.productName || "General Inquiry",
        message: `Customer Location: ${formData.location || "Not provided"}
Full Address: ${formData.fullAddress || "Not provided"}
Notes/Requirements: ${formData.notesRequirements || "None"}
GPS Coordinates: ${formData.locationType === "GPS" ? `${formData.latitude}, ${formData.longitude}` : "None"}`,
      });
      setStatus("success");
      toast.success("Your inquiry has been submitted successfully!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        productName: "",
        location: "",
        fullAddress: "",
        notesRequirements: "",
        latitude: "",
        longitude: "",
        locationType: "Manual",
        source: "Website Form",
      });
      setGpsSuccess(false);
    } catch (error) {
      setStatus("error");
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans overflow-x-hidden">
      {/* SECTION 1: Gradient Title Header Banner */}
      <section className="pt-24 pb-28 sm:pt-32 sm:pb-40 px-4 sm:px-6 bg-gradient-to-r from-[#85AEBE] to-[#396E7E] text-center">
        <h1 className="font-bodoni text-3xl sm:text-5xl lg:text-7xl font-normal text-zinc-950 tracking-wide">
          Get In Touch
        </h1>
        <p className="text-zinc-900/80 font-sans text-xs sm:text-sm max-w-2xl mx-auto mt-4 leading-relaxed font-light">
          We'll create high-quality linkable content and build at least 40 high-authority links to
          each asset, paving the way for you to grow your rankings, improve brand.
        </p>
      </section>

      {/* SECTION 2: Overlapping Contact Info & Form Card */}
      <section className="px-4 sm:px-6 lg:px-8 relative z-10 -mt-16 sm:-mt-24 lg:-mt-28">
        <div className="max-w-5xl mx-auto bg-white border border-zinc-100 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">

          {/* Left Column: Contact Information */}
          <div className="md:col-span-5 bg-[#8E6259] p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h2 className="font-bodoni text-2xl sm:text-3xl font-light tracking-wide mb-4">
                Contact Information
              </h2>
              <p className="text-zinc-100/80 text-xs sm:text-sm leading-relaxed mb-10 font-light">
                We'll create high-quality linkable content and build at least 40 high-authority.
              </p>

              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-white/95 shrink-0" />
                  <span>{settings?.phoneNumber || "+91 72614823049"}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-white/95 shrink-0" />
                  <span className="break-all">{settings?.emailAddress || "jkjwefnmhjdsjfm@gmail.com"}</span>
                </div>

                <div className="flex items-center gap-4">
                  <img src="/instagram.png" className="h-5 w-5 object-contain invert brightness-200 shrink-0" alt="Instagram" />
                  <span>{settings?.instagramUrl ? settings.instagramUrl.split('/').pop() : "Gabha_claystore"}</span>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-white/95 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">
                    {settings?.companyAddress || "Kothrud Pune Maharashtra"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="md:col-span-7 p-6 sm:p-10 bg-white">
            {status === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs sm:text-sm font-medium">
                Thank you! Your inquiry has been received. We will contact you shortly.
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm font-medium">
                There was an error sending your message. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Product/Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clay Portrait, Sculpture"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Customer Location (GPS Option)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City / Region"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleGPSCapture}
                    disabled={gpsLoading}
                    className={`px-4 py-3 border flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all ${gpsSuccess
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                      }`}
                  >
                    <Navigation
                      className={`h-4 w-4 ${gpsLoading ? "animate-spin" : ""}`}
                    />
                    {gpsLoading ? "Capturing" : gpsSuccess ? "GPS Saved" : "Share GPS"}
                  </button>
                </div>
                {gpsSuccess && (
                  <p className="text-xs text-green-700 font-medium mt-1">
                    ✓ Coordinates captured: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Full Address
                </label>
                <textarea
                  rows={2}
                  value={formData.fullAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, fullAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors resize-none"
                  placeholder="Apartment, street address, postal code..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Message / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  value={formData.notesRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notesRequirements: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8FA1] focus:ring-1 focus:ring-[#4F8FA1] transition-colors resize-none"
                  placeholder="Detail your size, prefered media, deadlines..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-3 bg-[#4F8FA1] text-white font-semibold rounded-xl hover:bg-[#3D7888] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
              >
                {status === "loading" ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 3: Google Maps integration */}
      <section className="max-w-5xl mx-auto my-16 px-4 sm:px-6">
        <div className="w-full h-[320px] sm:h-[450px] rounded-[24px] overflow-hidden border border-zinc-100 shadow-lg bg-zinc-50 relative">
          {settings?.googleMapsLink ? (
            <iframe
              src={settings.googleMapsLink}
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Gabha Studio Location Map"
            />
          ) : (
            // Fallback Google Maps iframe for Pune showroom if none set
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.3813988636906!2d73.81230067583625!3d18.511634969447432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d1!2sKothrud%20Pune!5e0!3m2!1sen!2sin!4v1716768390000"
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Fallback Pune Location Map"
            />
          )}
        </div>
      </section>
      <AppointmentSection />
    </div>
  );
};

export default Contact;
