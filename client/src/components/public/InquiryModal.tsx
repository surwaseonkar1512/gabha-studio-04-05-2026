import { useState } from 'react';

type InquiryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    product: any;
};

const InquiryModal = ({ isOpen, onClose, product }: InquiryModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // You can wire this to your actual API endpoint
            console.log('Inquiry submitted:', { ...formData, product: product.name });
            // Optionally show a success message
            alert('Inquiry sent successfully!');
            setFormData({ name: '', email: '', mobile: '', address: '', message: '' });
            onClose();
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert('Failed to send inquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                    <div>
                        <h2 className="text-2xl font-bold text-black">Get Quote</h2>
                        <p className="text-sm text-zinc-600 mt-1">{product?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-black transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Your address"
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">Message (Optional)</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any additional details..."
                            rows={3}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-black font-bold hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Inquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InquiryModal;
