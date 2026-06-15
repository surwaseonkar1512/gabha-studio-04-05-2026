import React from 'react';

type PortfolioGalleryProps = {
    galleries: any[];
    activeGalleryTab: string;
    setActiveGalleryTab: (value: string) => void;
};

const PortfolioGallery = ({ galleries, activeGalleryTab, setActiveGalleryTab }: PortfolioGalleryProps) => {
    const selectedGallery = galleries.find((gallery) => gallery._id === activeGalleryTab);

    if (galleries.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-zinc-50 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-black uppercase tracking-widest mb-4 font-sans">Our Portfolios</h2>
                    <div className="h-1 w-20 bg-[#D4AF37] mx-auto mb-6"></div>

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
    );
};

export default PortfolioGallery;
