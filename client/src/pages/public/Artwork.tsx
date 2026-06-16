import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import Gabha from "../../components/public/Gabha";
import InquiryModal from "../../components/public/InquiryModal";
import EmptyProductState from "../../components/public/EmptyProductState";
import { Star } from "lucide-react";
import AppointmentSection from "../../components/public/AppointmentSection";

const Artwork = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryModal, setInquiryModal] = useState<{
    open: boolean;
    product: any;
  }>({ open: false, product: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get("/cms/categories"),
          api.get("/cms/products?isActive=true"),
        ]);
        setCategories(categoriesRes.data);
        setAllProducts(productsRes.data);
      } catch (error) {
        console.error("Failed to load categories/products for artwork page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allProducts;
    if (selectedCategory !== "all") {
      filtered = allProducts.filter(
        (p) => p.category?._id === selectedCategory
      );
    }
    setDisplayedProducts(filtered);
  }, [selectedCategory, allProducts]);

  return (
    <div className="bg-white min-h-screen text-black ">
      {/* SECTION 1: Heading & GABHA letters */}
      <section className="pt-24 pb-12 text-center bg-white px-4 sm:px-6">
        <h1 className="font-bodoni text-4xl sm:text-5xl lg:text-7xl font-light text-zinc-900 tracking-wide">
          Our Artwork
        </h1>

        {/* Gabha Letters Component */}
        <div className="my-8">
          <Gabha />
        </div>

        {/* Text Description and Inquire button row */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
          <p className="text-zinc-500 font-instrument-sans text-sm sm:text-base leading-relaxed text-center md:text-left max-w-[300px]">
            each asset, paving the way for you to grow your rankings, improve brand each asset, paving the way for you to grow.
          </p>

          <div className="flex items-center gap-4 shrink-0">
            {/* Arrow line ornament */}
            <div className="hidden md:flex items-center gap-2">
              <div className="h-[1px] bg-zinc-400 w-[320px] relative">
                <div className="absolute  right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-zinc-400 transform rotate-45"></div>
              </div>
            </div>

            <button
              onClick={() => setInquiryModal({ open: true, product: null })}
              className="bg-[#8E6259] text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-all duration-300 font-sans text-sm sm:text-base font-semibold shadow-md tracking-wider cursor-pointer"
            >
              Inquire Now
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Large Sculptor Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="w-full aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7] rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
          <img
            src="/sculptor_banner.png"
            alt="Artisan molding a clay sculpture"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* SECTION 3: about us & Static Sculptures */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header & Description Row */}
          <div className="flex flex-col   gap-6 mb-12">
            <h2 className="font-bodoni text-start text-6xl sm:text-7xl lg:text-[100px] text-zinc-950 leading-none tracking-tight shrink-0">
              about <span className="text-[#9E7A68]">us</span>
            </h2>
            <div className="max-w-full text-end">
              <p className="text-zinc-800 font-sans text-sm sm:text-base lg:text-[17px] leading-relaxed font-normal">
                <span className="text-[#9E7A68] font-semibold">Clay sculptures</span> are not only artistic masterpieces but also symbols of <br className="hidden lg:block" />
                <span className="text-[#9E7A68] font-semibold">craftsmanship and creativity</span> passed down <span className="text-[#9E7A68] font-semibold">through generations</span>. They can <br className="hidden lg:block" />
                transform spaces, evoke emotions, and preserve stories through artistic <br className="hidden lg:block" />
                expression.
              </p>
            </div>
          </div>

          {/* 4-column Static Sculpture Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { src: "/sculpture_head_art.png", alt: "Abstract Head Sculpture" },
              { src: "/sculpture_family_art.png", alt: "Family Clay Sculpture" },
              { src: "/sculpture_elephants_art.png", alt: "Elephants Clay Sculpture" },
              { src: "/sculpture_giraffes.png", alt: "Giraffes Clay Sculpture" },
            ].map((img, idx) => (
              <div
                key={idx}
                className="aspect-[1.5/1] rounded-xl overflow-hidden shadow-sm border border-zinc-100 group"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Category wise Products (Feature Products) */}
      <section className="py-12 sm:py-16 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Section Header */}
          <div className="text-center mb-10 space-y-1">
            <h3 className="font-tangerine text-3xl sm:text-5xl font-bold text-zinc-800">
              Our category
            </h3>
            <p className="text-xl sm:text-3xl font-fraunces font-medium text-[#267C87]">
              Explore our handcrafted collections inspired by timeless clay artistry.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-zinc-200 border-t-zinc-800 rounded-full mx-auto"></div>
              <p className="text-zinc-500 mt-4 font-sans text-sm">Loading handcrafted collections...</p>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden justify-start md:justify-center items-center gap-3 mb-12 pb-3 max-w-full px-4 -mx-4 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-6 py-2.5 border rounded-full text-[14px] tracking-wider transition-all duration-200 shrink-0 font-sans cursor-pointer ${selectedCategory === "all"
                    ? "bg-[#BFD0E3] border-zinc-300 text-zinc-900 font-semibold shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-black"
                    }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`px-6 py-2.5 border rounded-full text-[14px] tracking-wider transition-all duration-200 shrink-0 font-sans cursor-pointer ${selectedCategory === category._id
                      ? "bg-[#BFD0E3] border-zinc-300 text-zinc-900 font-semibold shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-black"
                      }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>

              {/* Products Custom Grid */}
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {displayedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="group relative w-full aspect-[3/4] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Product Image */}
                      <img
                        src={product.productImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      {/* Overlapping Bottom Details Card */}
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col">
                        {/* Tab Row (Stars on left, Button on right) */}
                        <div className="flex items-end justify-between px-3 sm:px-4">
                          {/* Left Tab: White background, rounded top corners */}
                          <div className="bg-white rounded-t-[16px] sm:rounded-t-[20px] px-4 py-2 sm:py-2.5 flex items-center justify-center shrink-0">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0"
                                />
                              ))}
                            </div>
                          </div>

                          {/* Right: Read More Link on Image Background */}
                          <Link
                            to={`/product/${product._id}`}
                            className="mb-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#BFD0E3] text-[#2c3d52] hover:bg-opacity-95 transition-all duration-200 cursor-pointer shadow-sm shrink-0 text-center"
                          >
                            Read More
                          </Link>
                        </div>

                        {/* Main White Content Card */}
                        <div className="bg-white px-4 pb-4 pt-3 sm:px-5 sm:pb-5 rounded-b-[24px] sm:rounded-b-[32px] rounded-tr-[16px] sm:rounded-tr-[20px] shadow-lg">
                          {/* Title */}
                          <h4 className="font-bodoni text-base sm:text-lg lg:text-xl font-medium text-zinc-950 leading-tight truncate">
                            {product.name}
                          </h4>

                          {/* Description */}
                          <p className="font-sans text-[11px] sm:text-xs text-zinc-500 mt-1.5 line-clamp-3 leading-relaxed">
                            {product.shortDescription || "Individually handcrafted clay sculpture created with exceptional attention to detail, perfect for enhancing home interiors and offices."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyProductState />
              )}
            </>
          )}
        </div>
      </section>

      {/* Inquiry Modal */}

      <AppointmentSection />
    </div>
  );
};

export default Artwork;
