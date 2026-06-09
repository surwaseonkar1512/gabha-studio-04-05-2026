import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight, MessageSquare, ArrowUpRight } from 'lucide-react';
import api from '../../api/axiosInstance';

const Home = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
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
        const [bannersRes, aboutRes, productsRes, igRes, testimonialsRes, galleriesRes] = await Promise.all([
          api.get('/cms/banners'),
          api.get('/cms/about'),
          api.get('/cms/products?showOnHomepage=true&isActive=true'),
          api.get('/cms/instagram'),
          api.get('/cms/testimonials'),
          api.get('/cms/gallery')
        ]);

        const activeBanners = bannersRes.data.filter((b: any) => b.isActive);
        setBanners(activeBanners);
        setAboutUs(aboutRes.data);
        setFeaturedProducts(productsRes.data);
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

  const selectedGallery = galleries.find(g => g._id === activeGalleryTab);

  return (
    <div className="bg-white">
      {/* 1. Hero Banner Carousel / Fallback */}
      <section className="relative h-[85vh] bg-black overflow-hidden flex items-center">
        {banners.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                {/* Responsive picture */}
                <picture className="absolute inset-0 w-full h-full">
                  {banner.mobileBannerImage && (
                    <source media="(max-width: 640px)" srcSet={banner.mobileBannerImage} />
                  )}
                  <img
                    src={banner.bannerImage}
                    alt={banner.title}
                    className="w-full h-full object-cover mix-blend-luminosity opacity-40"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {banner.subtitle && (
                      <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-6 duration-700">
                        {banner.subtitle}
                      </p>
                    )}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-widest uppercase animate-in fade-in duration-700">
                      {banner.title}
                    </h1>
                    {banner.description && (
                      <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed animate-in fade-in duration-1000">
                        {banner.description}
                      </p>
                    )}
                    {banner.ctaText && (
                      <div className="pt-4 animate-in slide-in-from-bottom-6 duration-700">
                        <Link
                          to={banner.ctaLink || '/contact'}
                          className="inline-flex items-center px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                        >
                          {banner.ctaText} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Slider arrows */}
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
          /* Fallback Hero */
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

      {/* 2. Dynamic About Us Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {aboutUs ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Images overlapping setup */}
              <div className="lg:col-span-5 flex flex-row gap-4 items-center justify-center lg:justify-start">
                {aboutUs.leftImage && (
                  <div className="w-1/2 aspect-square rounded-2xl overflow-hidden shadow-lg border border-zinc-200 hover:scale-[1.02] transition-transform">
                    <img src={aboutUs.leftImage} alt="About artwork left" className="w-full h-full object-cover" />
                  </div>
                )}
                {aboutUs.rightImage && (
                  <div className="w-1/2 aspect-square rounded-2xl overflow-hidden shadow-lg border border-zinc-200 translate-y-6 hover:scale-[1.02] transition-transform">
                    <img src={aboutUs.rightImage} alt="About artwork right" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Right Content */}
              <div className="lg:col-span-7 space-y-6 lg:pl-6">
                {aboutUs.subtitle && (
                  <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">{aboutUs.subtitle}</p>
                )}
                <h2 className="text-3xl sm:text-4xl font-bold text-black uppercase tracking-widest">{aboutUs.title}</h2>
                <div className="h-1 w-20 bg-[#D4AF37]"></div>

                {aboutUs.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: aboutUs.description }}
                    className="prose dark:prose-invert max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4"
                  />
                ) : (
                  <p className="text-gray-500 italic">No details provided yet.</p>
                )}

                {aboutUs.ctaText && (
                  <div className="pt-4">
                    <Link
                      to={aboutUs.ctaLink || '/about'}
                      className="inline-flex items-center px-6 py-3 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors"
                    >
                      {aboutUs.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Fallback About */
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-widest text-black">A Legacy of Stone</h2>
              <div className="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Founded in the heart of the artisan district, Gabha Studio began with a singular vision: to craft sculptures that transcend time.
              </p>
              <Link to="/about" className="inline-block text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-[#D4AF37]">
                Learn more
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Sculptures Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-4">Featured Collection</h2>
            <div className="h-1 w-24 bg-[#D4AF37] mx-auto"></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Browse some of our premium marble and stone statues featured on our homepage catalog.
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="group relative overflow-hidden bg-gray-50 border border-gray-100 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                    <img
                      src={product.productImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-[#990000] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow z-10">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{product.category?.title}</span>
                      <h3 className="text-lg font-bold text-black uppercase tracking-wider mt-1">{product.name}</h3>
                      {product.shortDescription && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-2">
                      <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-500">${product.price.toLocaleString()}</span>
                      <Link
                        to="/contact"
                        className="text-xs font-bold uppercase tracking-widest text-black border-b border-[#D4AF37] pb-0.5 hover:text-[#D4AF37] transition-colors"
                      >
                        Inquire Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback products list */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[1, 2, 3].map((item) => (
                <div key={item} className="group relative overflow-hidden bg-gray-50 border border-gray-100">
                  <div className="aspect-[3/4] bg-zinc-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Star className="h-12 w-12" />
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-black uppercase tracking-wider mb-2">Eternity Figure {item}</h3>
                    <p className="text-[#990000] font-medium mb-4">Limited Edition</p>
                    <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-black border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors">
                      Inquire Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Portfolio / Gallery Showcase Tabs */}
      {galleries.length > 0 && (
        <section className="py-24 bg-zinc-50 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-4 font-sans">Our Portfolios</h2>
              <div className="h-1 w-20 bg-[#D4AF37] mx-auto mb-6"></div>

              {/* Category tabs */}
              <div className="flex flex-wrap justify-center gap-2">
                {galleries.map((gallery) => (
                  <button
                    key={gallery._id}
                    onClick={() => setActiveGalleryTab(gallery._id)}
                    className={`px-5 py-2 border rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeGalleryTab === gallery._id
                      ? 'bg-black border-black text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-black'
                      }`}
                  >
                    {gallery.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Images Grid */}
            {selectedGallery && selectedGallery.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedGallery.images.map((img: any, idx: number) => (
                  <a
                    key={idx}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-square bg-zinc-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-200"
                  >
                    <img
                      src={img.url}
                      alt={`Gallery view ${idx}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-3 py-1.5 rounded">
                        View Image
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400 italic text-sm">No images in this portfolio gallery.</p>
            )}
          </div>
        </section>
      )}

      {/* 5. Aesthetic Banner Section */}
      <section className="py-24 bg-[#990000] text-white text-center px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest leading-tight">
            The Intersection of Passion and Precision
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Every curve, every texture is meticulously shaped by our master artisans to deliver absolute perfection.
          </p>
          <div className="pt-4">
            <Link
              to="/about"
              className="inline-block px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-[#990000] transition-colors text-sm shadow-md hover:shadow-lg"
            >
              Discover Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Slider */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-4">Client Endorsements</h2>
              <div className="h-1 w-24 bg-[#D4AF37] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t._id} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-6 right-6 text-zinc-200">
                    <MessageSquare size={36} className="fill-current" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          className={idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-600 text-sm leading-relaxed italic">
                      "{t.message}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-zinc-200/50 mt-6 shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
                      {t.image ? (
                        <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-zinc-500 uppercase">{t.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-zinc-400 font-semibold">{t.designation || 'Collector'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Instagram Feed Grid */}
      {instagramPosts.length > 0 && (
        <section className="py-20 bg-zinc-50 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-black uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                Instagram Feed
              </h2>
              <div className="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {instagramPosts.map((post) => (
                <a
                  key={post._id}
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-200 bg-zinc-100"
                >
                  <img
                    src={post.image}
                    alt={post.caption || 'Instagram feed'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                    <p className="text-[10px] line-clamp-2 leading-snug">{post.caption || 'View post'}</p>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-pink-400 mt-1 flex items-center gap-0.5">
                      Instagram <ArrowUpRight size={10} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
