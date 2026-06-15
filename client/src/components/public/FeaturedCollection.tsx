import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import ProductCard from "./ProductCard";
import InquiryModal from "./InquiryModal";
import EmptyProductState from "./EmptyProductState";

type FeaturedCollectionProps = {
  // Featured products are now fetched directly from API
};

const FeaturedCollection = ({}: FeaturedCollectionProps) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [inquiryModal, setInquiryModal] = useState<{
    open: boolean;
    product: any;
  }>({ open: false, product: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get("/cms/categories"),
          api.get("/cms/products?isActive=true"),
        ]);
        setCategories(categoriesRes.data);
        setAllProducts(productsRes.data);
        setSelectedCategory("all");
      } catch (error) {
        console.error("Failed to load categories/products:", error);
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
        (p) => p.category?._id === selectedCategory,
      );
    }

    setDisplayedProducts(filtered.slice(0, 6));
    setShowMore(filtered.length > 6);
  }, [selectedCategory, allProducts]);

  return (
    <section className="py-24 ">
      <div className="relative">
        {/* inline sculpture image — replace src with your actual asset */}
        <div className="absolute -top-20 right-0 transform -translate-y-1/2">
          <img src="/proudctTopng.png" alt="clay figures" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-1">
          <h2 className="font-tangerine text-xl sm:text-3xl text-black font-bold">
            All Products
          </h2>
          <p className="text-2xl sm:text-4xl font-fraunces font-normal text-[#267C87]">
            Shop Signature Collection
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full mx-auto"></div>
            <p className="text-zinc-600 mt-4">Loading categories...</p>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-5 py-2.5 border rounded-full text-md font-normal  tracking-wider transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-[#BFD0E3] border-black text-black border border-white shadow-lg"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-black"
                }`}
              >
                All Products
              </button>
              <div className="gap-3 flex flex-wrap justify-center ">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`px-5 py-2.5 border rounded-full text-md font-normal tracking-wider transition-all duration-200 ${
                      selectedCategory === category._id
                        ? "bg-[#BFD0E3] border-black text-black border border-white shadow-lg"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-black shadow-lg"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      onInquire={(prod) =>
                        setInquiryModal({ open: true, product: prod })
                      }
                    />
                  ))}
                </div>

                {/* Show More Button */}
                {showMore && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => {
                        const categorySlug =
                          selectedCategory === "all"
                            ? "all"
                            : categories.find((c) => c._id === selectedCategory)
                                ?.slug;
                        navigate(`/products/${categorySlug}`);
                      }}
                      className="px-8 py-3 border-2 border-black text-black font-bold  tracking-wider hover:bg-black hover:text-white transition-all duration-300"
                    >
                      View All Products
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyProductState />
            )}
          </>
        )}

        {/* Inquiry Modal */}
        <InquiryModal
          isOpen={inquiryModal.open}
          onClose={() => setInquiryModal({ open: false, product: null })}
          product={inquiryModal.product}
        />
      </div>
    </section>
  );
};

export default FeaturedCollection;
