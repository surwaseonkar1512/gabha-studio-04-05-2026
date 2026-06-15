import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import HomeBanner from '../../components/public/HomeBanner';
import AboutSection from '../../components/public/AboutSection';
import FeaturedCollection from '../../components/public/FeaturedCollection';
import SwiperGallery from '../../components/public/SwiperGallery';
import AestheticBanner from '../../components/public/AestheticBanner';
import TestimonialsSection from '../../components/public/TestimonialsSection';
import InstagramFeed from '../../components/public/InstagramFeed';
import Gabha from '../../components/public/Gabha';

const Home = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, aboutRes, igRes, testimonialsRes, galleriesRes] = await Promise.all([
          api.get('/cms/banners'),
          api.get('/cms/about'),
          api.get('/cms/instagram'),
          api.get('/cms/testimonials'),
          api.get('/cms/gallery')
        ]);

        const activeBanners = bannersRes.data.filter((b: any) => b.isActive);
        setBanners(activeBanners);
        setAboutUs(aboutRes.data);
        setInstagramPosts(igRes.data);
        setTestimonials(testimonialsRes.data.filter((t: any) => t.isActive));

        const activeGalleries = galleriesRes.data.filter((g: any) => g.isActive);
        setGalleries(activeGalleries);
        if (activeGalleries.length > 0) {
          setActiveGalleryTab(activeGalleries[0]._id);
        }
      } catch (error) {
        console.error('Failed to load home page content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  return (
    <div className="bg-white">
      <HomeBanner banners={banners} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
      <AboutSection aboutUs={aboutUs} />
      <SwiperGallery galleries={galleries} activeGalleryTab={activeGalleryTab} setActiveGalleryTab={setActiveGalleryTab} />
      <Gabha />
      <FeaturedCollection />
      <AestheticBanner />
      <TestimonialsSection testimonials={testimonials} />
      <InstagramFeed instagramPosts={instagramPosts} />
    </div>
  );
};

export default Home;
