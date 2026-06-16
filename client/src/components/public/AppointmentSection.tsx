import React, { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const AppointmentSection: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/contacts/public", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Appointment Booking: ${form.reason || 'General Inquiry'}`,
        message: `Preferred Date: ${form.date || 'Not specified'}\nReason: ${form.reason || 'Not specified'}`,
      });
      toast.success("Contact request sent successfully! We will contact you shortly.");
      setForm({
        name: "",
        email: "",
        phone: "",
        reason: "",
        date: "",
      });
    } catch (error: any) {
      console.error("Failed to submit appointment lead", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to send request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto my-12 sm:my-20 lg:my-24 px-6" id="project">
      <div className="relative w-full rounded-[40px] overflow-hidden shadow-2xl bg-zinc-950 flex flex-col lg:flex-row">
        {/* Left Side: Crisp Image */}
        <div className="w-full lg:w-1/2 min-h-[200px] sm:min-h-[300px] lg:min-h-[550px] relative">
          <img
            src="/bookapointment.png"
            alt="Artist sculpting clay face close up"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>
        </div>

        {/* Right Side: Form on blurred image overlay */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] sm:min-h-[450px] lg:min-h-[550px] flex items-center justify-center p-5 sm:p-8 md:p-12 lg:p-16">
          {/* Blurred background image layer */}
          <div className="absolute inset-0 z-0">
            <img
              src="/bookapointment.png"
              alt="Sculpting background blurred"
              className="w-full h-full object-cover blur-md scale-105"
            />
            <div className="absolute inset-0 bg-zinc-100/70 backdrop-blur-md"></div>
          </div>

          {/* Form content (on top of blur) */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[480px] relative z-10 space-y-6"
          >
            <div className="space-y-1 text-center lg:text-left">
              <h3 className="text-3xl sm:text-4xl font-fraunces font-semibold text-zinc-900 leading-tight">
                Contact Us              </h3>
              <p className="text-zinc-600 text-sm font-instrument-sans">
                We'd love to hear from you! Send us a message and we'll get back to you shortly.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name input */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                  required
                  className="w-full px-5 py-3.5 bg-white text-zinc-900 rounded-xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-[#1e606b] shadow-sm text-base placeholder-zinc-400"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-5 py-3.5 bg-white text-zinc-900 rounded-xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-[#1e606b] shadow-sm text-base placeholder-zinc-400"
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="w-full px-5 py-3.5 bg-white text-zinc-900 rounded-xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-[#1e606b] shadow-sm text-base placeholder-zinc-400"
                />
              </div>

              {/* Reason and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Reason"
                  className="w-full px-5 py-3.5 bg-white text-zinc-900 rounded-xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-[#1e606b] shadow-sm text-base placeholder-zinc-400"
                />
                <input
                  type="text"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="dd-mm-yy"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  className="w-full px-5 py-3.5 bg-white text-zinc-900 rounded-xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-[#1e606b] shadow-sm text-base placeholder-zinc-400"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-zinc-900 text-white font-semibold py-4 rounded-xl shadow-lg transition-colors duration-300 tracking-wider text-base uppercase disabled:bg-zinc-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
