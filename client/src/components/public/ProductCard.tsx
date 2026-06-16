type ProductCardProps = {
    product: any;
    index: number;
    onInquire: (product: any) => void;
};

const ProductCard = ({ product, onInquire }: ProductCardProps) => {
    return (
        <div className="group relative w-full max-w-[170px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] mx-auto">

            {/* Card */}
            <div className="relative overflow-hidden rounded-[16px] sm:rounded-[28px] bg-[#f5f5f5]">

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                    <img
                        src={product.productImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Floating Bottom Panel */}
                <div className="absolute bottom-2 sm:bottom-4 left-1.5 sm:left-3 right-1.5 sm:right-3">

                    <div className="bg-white rounded-[10px] sm:rounded-[14px] p-1.5 sm:p-3 shadow-lg">

                        {/* Title */}
                        <p className="text-[10px] sm:text-[13px] text-center text-[#3A3A3A] mb-1.5 sm:mb-3 leading-none truncate font-medium">
                            {product.name}
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => onInquire(product)}
                            className="w-full h-[30px] sm:h-[42px] rounded-[6px] sm:rounded-[8px]
                            bg-[#8E6259]
                            text-white
                            text-[11px] sm:text-[14px]
                            font-medium
                            transition
                            hover:opacity-90
                            cursor-pointer"
                        >
                            Get Quote
                        </button>

                    </div>

                </div>

                {/* Optional Tag */}
                {product.tag && (
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                        <span className="bg-[#990000] text-white text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {product.tag}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;