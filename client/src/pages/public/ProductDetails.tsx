import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import InquiryModal from "../../components/public/InquiryModal";
import { Star, ArrowLeft, ShieldCheck, Award, Sparkles } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productRes = await api.get(`/cms/products/${id}`);
        setProduct(productRes.data);

        // Fetch related products (same category)
        const categoryId = productRes.data.category?._id;
        if (categoryId) {
          const allProductsRes = await api.get(`/cms/products?isActive=true`);
          const filtered = allProductsRes.data.filter(
            (p: any) => p.category?._id === categoryId && p._id !== id
          );
          setRelatedProducts(filtered.slice(0, 3));
        }
      } catch (err: any) {
        console.error("Error fetching product detail:", err);
        setError("Failed to load product details. It may not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full mx-auto"></div>
          <p className="text-zinc-500 mt-4 font-sans text-sm">Loading artwork details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen text-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="font-fraunces text-3xl font-bold text-zinc-900 mb-4">Artwork Not Found</h2>
          <p className="text-zinc-500 text-sm sm:text-base mb-6">{error || "The requested artwork could not be found."}</p>
          <Link
            to="/artwork"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full font-sans font-semibold hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artwork
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-black pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 mb-8">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link to="/artwork" className="hover:text-black transition">Artwork</Link>
          <span>/</span>
          <span className="text-zinc-800 font-medium truncate">{product.name}</span>
        </nav>

        {/* Back Link */}
        <Link
          to="/artwork"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors font-sans text-sm font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Image Container */}
          <div className="lg:col-span-6 w-full">
            <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-md border border-zinc-100 bg-[#FAF9F6] group">
              <img
                src={product.productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-6 flex flex-col pt-2">
            {/* Category title */}
            {product.category?.title && (
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#9E7A68]">
                {product.category.title}
              </span>
            )}

            {/* Title */}
            <h1 className="font-bodoni text-3xl sm:text-4xl lg:text-5xl font-light text-zinc-950 mt-3 leading-tight tracking-wide">
              {product.name}
            </h1>

            {/* 5 Stars Rating & Feedback */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-zinc-500 font-medium">
                (5.0 out of 5 • Handcrafted Quality Verified)
              </span>
            </div>

            {/* Price section */}
            <div className="mt-6 pb-6 border-b border-zinc-100">
              {product.price && product.price > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-semibold text-zinc-900">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">USD (Estimated)</span>
                </div>
              ) : (
                <span className="text-zinc-600 text-lg sm:text-xl font-medium italic">
                  Price on Request
                </span>
              )}
            </div>

            {/* Short Description */}
            <div className="py-6 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-2">
                Overview Description
              </h3>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                {product.shortDescription ||
                  "Individually handcrafted clay sculpture created with exceptional attention to detail, perfect for enhancing home interiors and offices."}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="py-6 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-3">
                Artwork Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Material</span>
                  <span className="font-medium text-zinc-800">Natural Organic Clay</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Crafting</span>
                  <span className="font-medium text-zinc-800">100% Hand Sculpted</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Kiln Fired</span>
                  <span className="font-medium text-zinc-800">Yes (High Temp)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Coating</span>
                  <span className="font-medium text-zinc-800">Matte Protective Wax</span>
                </div>
              </div>
            </div>

            {/* Premium Trust Elements */}
            <div className="grid grid-cols-3 gap-4 py-6 text-center text-zinc-600">
              <div className="flex flex-col items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#9E7A68]" />
                <span className="text-[10px] sm:text-xs font-semibold">Unique Art</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-[#9E7A68]" />
                <span className="text-[10px] sm:text-xs font-semibold">Secure Packing</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Award className="w-5 h-5 text-[#9E7A68]" />
                <span className="text-[10px] sm:text-xs font-semibold">Certified Origin</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="flex-1 bg-[#8E6259] text-white text-center py-4 rounded-full font-semibold hover:bg-opacity-95 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-md tracking-wider text-sm sm:text-base"
              >
                Inquire & Get Quote
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: Related Artworks */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-zinc-100">
            <div className="text-center md:text-left mb-10">
              <h2 className="font-bodoni text-2xl sm:text-3xl text-zinc-950 font-light tracking-wide">
                You May Also Like
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Explore more unique clay sculptures from the same collection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p._id}`}
                  className="group bg-[#FAF9F6] border border-zinc-100 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col p-4"
                >
                  <div className="aspect-[4/5] rounded-[14px] overflow-hidden bg-zinc-100">
                    <img
                      src={p.productImage}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="mt-4 flex-grow flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-[#8E6259]">Read More</span>
                    </div>
                    <h4 className="font-fraunces text-base font-bold text-zinc-900 mt-3 truncate">
                      {p.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
