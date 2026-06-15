const EmptyProductState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-6">
                <svg
                    className="w-32 h-32 text-zinc-300 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">No Products Found</h3>
            <p className="text-zinc-600 text-center max-w-sm">
                We're currently curating products for this category. Check back soon!
            </p>
        </div>
    );
};

export default EmptyProductState;
