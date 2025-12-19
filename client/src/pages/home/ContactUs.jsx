// ContactUs.jsx
import React from "react";

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="py-16 px-6 bg-gray-50 flex flex-col items-center"
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Form + Newsletter */}
        <div>
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Contact Us</h2>
          <p className="text-gray-600 mb-8">
            Have questions about loans or need assistance? Fill out the form below and our team will reach out.
          </p>

          {/* Contact Form */}
          <form className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Message"
              rows="4"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Submit Request
            </button>
          </form>

          {/* Newsletter Signup */}
          <div className="mt-10 bg-blue-50 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with the latest loan policies, employee resources, and company announcements.
            </p>
            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
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

        {/* Right: Inline SVG Illustration */}
        <div className="flex justify-center items-center">
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