import React, { useState } from "react";
import axios from "axios";

// Standard production URL setup (matches your other components)
const API_BASE_URL = "https://mg-finance-a0tt.onrender.com"; 

export default function ContactUs() {
  // 1. Form States
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  // 2. Input Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    try {
      // Endpoint usually routes to a mailer service or database log in your backend
      await axios.post(`${API_BASE_URL}/contact`, formData);
      
      setStatus({ 
        loading: false, 
        error: null, 
        success: "Thank you! Your request has been sent successfully." 
      });
      setFormData({ name: "", email: "", message: "" }); // Reset form
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus({ 
        loading: false, 
        success: null, 
        error: err.response?.data?.error || "Failed to send request. Please try again later." 
      });
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/newsletter/subscribe`, { email: newsletterEmail });
      alert("Subscribed successfully!");
      setNewsletterEmail("");
    } catch (err) {
      alert("Subscription failed. Please check your email.");
    }
  };

  return (
    <section id="contact" className="py-16 px-6 bg-gray-50 flex flex-col items-center">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column */}
        <div>
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Contact Us</h2>
          <p className="text-gray-600 mb-8">
            Have questions about loans or need assistance? Fill out the form below and our team will reach out.
          </p>

          {/* Alert Messages */}
          {status.success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow-sm">
              {status.success}
            </div>
          )}
          {status.error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm">
              {status.error}
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleContactSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={status.loading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={status.loading}
            />
            <textarea
              name="message"
              placeholder="Message"
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={status.loading}
            ></textarea>
            <button
              type="submit"
              disabled={status.loading}
              className={`w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-200 ${
                status.loading ? "opacity-50 cursor-wait" : ""
              }`}
            >
              {status.loading ? "Sending..." : "Submit Request"}
            </button>
          </form>

          {/* Newsletter Section */}
          <div className="mt-10 bg-blue-50 rounded-lg p-6 shadow-md border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Stay updated with the latest loan policies and announcements.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="flex justify-center items-center hidden md:flex">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 600 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="600" height="400" fill="#f0f4f8" />
            <g>
              <circle cx="150" cy="100" r="40" fill="#0077cc" />
              <text x="150" y="105" textAnchor="middle" fill="white" fontSize="20" fontFamily="Arial">Loan</text>
              <rect x="250" y="80" width="200" height="40" rx="8" fill="#ffd700" />
              <text x="350" y="105" textAnchor="middle" fill="#333" fontSize="18" fontFamily="Arial">Secure Finance</text>
              <line x1="150" y1="140" x2="350" y2="140" stroke="#0077cc" strokeWidth="2" />
              <rect x="100" y="160" width="400" height="180" rx="12" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
              <text x="300" y="190" textAnchor="middle" fill="#333" fontSize="16" fontFamily="Arial">Digital Loan Dashboard</text>
              <circle cx="180" cy="230" r="10" fill="#0077cc" />
              <circle cx="220" cy="230" r="10" fill="#0077cc" />
              <circle cx="260" cy="230" r="10" fill="#0077cc" />
              <rect x="320" y="220" width="120" height="20" rx="4" fill="#ffd700" />
              <text x="380" y="235" textAnchor="middle" fill="#333" fontSize="14" fontFamily="Arial">Apply Now</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}