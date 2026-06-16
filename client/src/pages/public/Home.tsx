import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import HomeBanner from "../../components/public/HomeBanner";
import AboutSection from "../../components/public/AboutSection";
import FeaturedCollection from "../../components/public/FeaturedCollection";
import SwiperGallery from "../../components/public/SwiperGallery";
import AestheticBanner from "../../components/public/AestheticBanner";
import TestimonialsSection from "../../components/public/TestimonialsSection";
import InstagramFeed from "../../components/public/InstagramFeed";
import Gabha from "../../components/public/Gabha";
import VideoArtwork from "../../components/public/VideoArtwork";
import AppointmentSection from "../../components/public/AppointmentSection";

const Home = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, aboutRes, igRes, testimonialsRes, galleriesRes] =
          await Promise.all([
            api.get("/cms/banners"),
            api.get("/cms/about"),
            api.get("/cms/instagram"),
            api.get("/cms/testimonials"),
            api.get("/cms/gallery"),
          ]);

        setBanners(bannersRes.data);
        setAboutUs(aboutRes.data);
        setInstagramPosts(igRes.data);
        setTestimonials(testimonialsRes.data);
        setGalleries(galleriesRes.data);

        if (galleriesRes.data.length > 0) {
          setActiveGalleryTab(galleriesRes.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching homepage data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Slideshow auto-play effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">Loading...</div>
    );
  }

  return (
    <div className="-mt-20">
      <HomeBanner
        banners={banners}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />

      {/* About Section (Full width container with internal constraints) */}
      <AboutSection aboutUs={aboutUs} />

      {/* Gallery Section (Full width container with internal constraints) */}
      <SwiperGallery
        galleries={galleries}
        activeGalleryTab={activeGalleryTab}
        setActiveGalleryTab={setActiveGalleryTab}
      />

      {/* Mid-page sections centered */}
      <div className="max-w-full mx-auto px-6 space-y-24 py-12">
        <Gabha />
        <FeaturedCollection />
        <VideoArtwork />
        <AppointmentSection />

        <TestimonialsSection testimonials={testimonials} />
        <InstagramFeed instagramPosts={instagramPosts} />
      </div>

      {/* Appointment Section */}
    </div>
  );
};

export default Home;
