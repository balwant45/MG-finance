import { useNavigate } from "react-router-dom";
import AboutUs from "./home/AboutUs";
import ContactUs from "./home/ContactUs";
import logo from "../assets/mgFinanceLogo.svg";
import hero from "../assets/bg.png";
import finance from "../assets/Corporate finance th.png"
import "./home/landingPage.css";

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
      id="landing-page"
    >
      {/* Overlay with lighter corporate tone */}
      <div className="bg-white bg-opacity-80 min-h-screen">
        
        {/* Navbar */}
        <nav className="bg-transparent sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <img src={logo} alt="MG Finance Logo" className="h-10" />
            <ul className="hidden md:flex space-x-8 text-gray-800 font-medium">
              <li><a href="#aboutus" className="hover:text-blue-600">About Us</a></li>
              <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
              <li>
                <button 
                  onClick={() => navigate("login")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Employee Login
                </button>
              </li>
            </ul>
             <button 
                  onClick={() => navigate("login")}
                  className="bg-blue-600 text-white px-2 py-2 rounded-md font-semibold hover:bg-blue-700 transition md:hidden"
                >
                  Employee Login
                </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen text-center text-gray-900 px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to MG Finance Portal
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-6">
            Your centralized platform for managing company loans, employee resources, and internal operations.
          </p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition transform hover:scale-105"
            
          >
        <a href="#contact">Contact Us</a> 
          </button>
        </section>

        {/* About Us Section */}
        <AboutUs />

        {/* Contact Section */}
        <ContactUs />

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-600 text-center py-6 mt-12">
          <p>© {new Date().getFullYear()} MG Finance. Internal Use Only.</p>
          <div className="flex justify-center space-x-6 mt-3">
            <a href="#" className="hover:text-blue-600">Help Desk</a>
            <a href="#" className="hover:text-blue-600">IT Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}