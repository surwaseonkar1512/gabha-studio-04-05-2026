type ProductCardProps = {
    product: any;
    index: number;
    onInquire: (product: any) => void;
};

const ProductCard = ({ product, onInquire }: ProductCardProps) => {
    return (
        <div className="group relative max-w-[260px] mx-auto">

            {/* Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-[#f5f5f5]">

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                    <img
                        src={product.productImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Floating Bottom Panel */}
                <div className="absolute bottom-4 left-3 right-3">

                    <div className="bg-white rounded-[14px] p-3 shadow-lg">

                        {/* Title */}
                        <p className="text-[13px] text-center text-[#3A3A3A] mb-3 leading-none">
                            {product.name}
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => onInquire(product)}
                            className="w-full h-[42px] rounded-[8px]
                            bg-[#8E6259]
                            text-white
                            text-[14px]
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
                    <div className="absolute top-4 left-4">
                        <span className="bg-[#990000] text-white text-[10px] px-3 py-1 rounded-full">
                            {product.tag}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;