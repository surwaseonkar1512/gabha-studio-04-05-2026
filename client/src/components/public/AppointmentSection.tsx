import React, { useState } from "react";

const AppointmentSection: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    date: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: hook this to your API
    console.log("book appointment", form);
    alert("Appointment request sent — we will contact you shortly.");
  };

  return (
    <section className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Left: background image */}
        <div
          className="h-80 lg:h-auto bg-center bg-cover"
          style={{ backgroundImage: "url('/bookapointment.png')" }}
          aria-hidden
        />

        {/* Right: form */}
        <div className="p-8 md:p-12 flex items-center">
          <form className="w-full" onSubmit={handleSubmit}>
            <h3 className="text-2xl sm:text-3xl font-fraunces mb-2">
              Book Your Appointment
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose a convenient time and we’ll get back to you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="px-4 py-3 border rounded bg-gray-50"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="px-4 py-3 border rounded bg-gray-50"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="px-4 py-3 border rounded bg-gray-50"
              />
              <input
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="dd-mm-yy"
                className="px-4 py-3 border rounded bg-gray-50"
              />
            </div>

            <div className="mt-3">
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Reason"
                className="w-full px-4 py-3 border rounded bg-gray-50"
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-black text-white px-6 py-3 font-medium rounded"
              >
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
