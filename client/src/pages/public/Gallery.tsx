import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const Gallery = () => {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Panoramic Slider State
  const [activeIndex, setActiveIndex] = useState(2);

  // Dynamically extract and shuffle slider images from all active galleries
  const sliderImages = useMemo(() => {
    const defaultSlider = [
      "/sculptor_banner.png",
      "/sculpture_head_art.png",
      "/sculpture_family_art.png",
      "/sculpture_elephants_art.png",
      "/sculpture_giraffes.png"
    ];

    if (!galleries || galleries.length === 0) {
      return defaultSlider;
    }

    const urls = galleries
      .flatMap((g) => g.images || [])
      .map((img: any) => img.url)
      .filter(Boolean);

    if (urls.length === 0) {
      return defaultSlider;
    }

    // Shuffle the images from active albums
    const shuffled = [...urls].sort(() => 0.5 - Math.random());

    const result = [...shuffled];
    while (result.length < 5) {
      result.push(defaultSlider[result.length % defaultSlider.length]);
    }

    return result.slice(0, 5);
  }, [galleries]);

  useEffect(() => {
    const fetchGalleries = async () => {
      setLoading(true);
      try {
        const res = await api.get("/cms/gallery");
        // Filter active albums
        const active = res.data.filter((g: any) => g.isActive);
        setGalleries(active);
        if (active.length > 0) {
          setSelectedGallery(active[0]);
        }
      } catch (err) {
        console.error("Error fetching gallery albums:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to our gallery updates!");
    setEmail("");
  };

  // Asymmetric photo list helper: if the DB is empty or has fewer images, fill with fallback assets
  const getGridImages = () => {
    const defaultList = [
      "/sculptor_banner.png",
      "/sculpture_head_art.png",
      "/sculpture_family_art.png",
      "/sculpture_elephants_art.png",
      "/sculpture_giraffes.png",
      "/sculptor_banner.png"
    ];

    if (!selectedGallery || !selectedGallery.images || selectedGallery.images.length === 0) {
      return defaultList;
    }

    // Extract urls
    const urls = selectedGallery.images
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
      .map((img: any) => img.url);

    // Pad with defaults if less than 6
    while (urls.length < 6) {
      urls.push(defaultList[urls.length % defaultList.length]);
    }
    return urls;
  };

  const gridImages = getGridImages();

  return (
    <div className="bg-white min-h-screen text-black font-sans overflow-x-hidden">
      {/* SECTION 1: Header */}
      <section className="pt-24 pb-8 text-center bg-white px-4 sm:px-6">
        <h1 className="font-bodoni text-4xl sm:text-5xl lg:text-7xl font-normal text-zinc-950 tracking-wide flex items-center justify-center flex-wrap gap-2">
          <span>Our</span>
          <span className="inline-block h-8 sm:h-12 w-16 sm:w-24 rounded-full overflow-hidden border border-zinc-200 align-middle aspect-[2/1] mx-1">
            <img src="/gallaryimgheder.png" className="w-full h-full object-cover" alt="Art detail" />
          </span>
          <span>Gallery</span>
        </h1>
        <p className="text-zinc-500 font-sans text-xs sm:text-sm max-w-2xl mx-auto mt-4 leading-relaxed">
          We'll create high-quality linkable content and build at least 40 high-authority links to
          each asset, paving the way for you to grow your rankings, improve brand.
        </p>
      </section>

      {/* SECTION 2: 3D Curved Concave Panoramic Carousel */}
      <section className="py-8 bg-white overflow-hidden px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative h-[220px] sm:h-[320px] md:h-[420px] flex items-center justify-center">
          <div className="flex items-center justify-center w-full gap-2 sm:gap-4 md:gap-6 perspective-[1200px]">
            {sliderImages.map((img, idx) => {
              const offset = idx - activeIndex;
              const absOffset = Math.abs(offset);

              // 3D curved/panoramic layout parameters
              let transformStyles = "";
              let zIndex = 10 - absOffset;
              let opacity = 1;

              if (offset === 0) {
                // Center active slide
                transformStyles = "scale(1) rotateY(0deg) translateZ(50px)";
              } else if (offset === -1) {
                // Immediate left
                transformStyles = "scale(0.88) rotateY(25deg) translateZ(0px) translateX(20px)";
              } else if (offset === 1) {
                // Immediate right
                transformStyles = "scale(0.88) rotateY(-25deg) translateZ(0px) translateX(-20px)";
              } else if (offset === -2) {
                // Far left
                transformStyles = "scale(0.76) rotateY(38deg) translateZ(-60px) translateX(40px)";
              } else if (offset === 2) {
                // Far right
                transformStyles = "scale(0.76) rotateY(-38deg) translateZ(-60px) translateX(-40px)";
              } else {
                opacity = 0; // Hide others
              }

              return (
                <div
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    transform: transformStyles,
                    zIndex: zIndex,
                    opacity: opacity,
                    transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  className="w-[18%] sm:w-[20%] aspect-[3/4] sm:aspect-[4/5] rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-lg border border-zinc-200 cursor-pointer bg-[#FAF9F6] origin-center shrink-0"
                >
                  <img src={img} alt="Featured sculpture" className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Filters & Asymmetric Grid */}
      <section className="py-12 sm:py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Dynamic Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {galleries.length > 0 ? (
              galleries.map((g) => {
                const isSelected = selectedGallery?._id === g._id;
                return (
                  <button
                    key={g._id}
                    onClick={() => setSelectedGallery(g)}
                    className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 cursor-pointer ${isSelected
                      ? "bg-[#BFD0E3] text-[#2c3d52] border-[#BFD0E3] shadow-sm"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                      }`}
                  >
                    {g.title}
                  </button>
                );
              })
            ) : (
              // Fallback Static Filter Pills
              ["Ceramic Gifts", "Wall Accessories", "Clay Sculpture", "Wall 3d Painting", "Interior Art"].map((tab, idx) => (
                <button
                  key={idx}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 cursor-pointer ${idx === 0
                    ? "bg-[#BFD0E3] text-[#2c3d52] border-[#BFD0E3] shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                >
                  {tab}
                </button>
              ))
            )}
          </div>

          {/* Dynamic Masonry Columns Layout with Auto Sized Images */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {gridImages.map((img, idx) => (
              <div
                key={idx}
                className="break-inside-avoid mb-6 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-zinc-100 bg-[#FAF9F6] group transition-all duration-300 hover:shadow-lg"
              >
                <img
                  src={img}
                  alt={`Gallery image ${idx + 1}`}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
