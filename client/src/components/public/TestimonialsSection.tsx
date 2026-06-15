import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

type TestimonialsSectionProps = {
    testimonials: any[];
};

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => {
    if (testimonials.length === 0) return null;

    return (
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
                                <p className="text-zinc-600 text-sm leading-relaxed italic">"{t.message}"</p>
                            </div>
                            <div className="flex items-center gap-3 pt-6 border-t border-zinc-200/50 mt-6 shrink-0">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
                                    {t.image ? (
                                        <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-zinc-500 uppercase">{t.name?.charAt(0)}</span>
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
    );
};

export default TestimonialsSection;
