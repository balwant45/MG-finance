import {  useNavigate } from "react-router-dom";
import AboutUs from "./home/AboutUs";
import ContactUs from "./home/ContactUs";
import logo from '../assets/mgFinanceLogo.svg';
import hero from "../assets/bg.png"
import Newsletter from "./home/Newsletter";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      className="font-sans min-h-screen"
      style={{
        backgroundImage: `url(${hero})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay to darken background */}
      <div className="bg-opacity-60 min-h-screen">
        {/* Navbar */}
        <nav className="bg-transparent shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-[#f7d997] font-bold text-xl">MG FINANCE</h1>
            <ul className="hidden md:flex space-x-6 text-[#f7d997] font-medium">
              <li><a href="#aboutus" className="hover:text-blue-600">About Us</a></li>
              <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-[#f7d997]">
          <img src={logo} alt="MG Finance Logo" className="mb-2" style={{height:"60%"}} />
          <button
            style={{
              borderColor: "#f7d997",
            }}
            className="btn bg-transparent text-[#f7d997] border transition-all duration-300 ease-in-out hover:bg-[#f7d997] hover:text-black hover:scale-105 hover:shadow-lg"
            onClick={() => navigate("login")}
          >
            PROCEED HERE
          </button>
        </div>

        {/* About Us Section */}
        <AboutUs />

        {/* Contact Section */}
        <ContactUs />
        {/* Footer */}
        <footer className="bg-transparent text-white text-center py-4">
          <p>© {new Date().getFullYear()} MG Finance. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
