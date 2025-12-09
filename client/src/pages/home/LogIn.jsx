import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import { logIn } from "../../utils/authSlice"; // Ensure path is correct

export default function LogIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Initialize hook
  
  // ✅ 1. State to capture user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To show login errors

  // Quote logic (kept as is)
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await axios.get("https://api.quotable.io/random");
        setQuote(response.data.content);
        setAuthor(response.data.author);
      } catch (error) {
        console.error("Error fetching quote:", error.message);
      }
    }
    fetchQuote();
  }, []);

  // ✅ 2. Real Login Logic
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setError("");

    try {
      // Send credentials to backend
      const response = await axios.post("/auth/login", {
        email: email,
        password: password
      });

      if (response.data.isAuthenticated) {
        // Dispatch to Redux with the user data from backend
        dispatch(logIn(response.data.user)); 
        
        // Redirect to Dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Show error message from backend or default text
      setError(err.response?.data || "Invalid Email or Password");
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        
        {/* Header Text */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Welcome Back!</h1>
          <p className="py-6 text-lg italic">
            {quote ? `"${quote}"` : "Loading quote..."}<br />
            {author && <span className="font-semibold">— {author}</span>}
          </p>
        </div>

        {/* Login Card */}
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            {/* ✅ Wrap inputs in a form for proper Enter key support */}
            <form onSubmit={handleLogin}>
              <fieldset className="fieldset">
                
                <label className="label">Email</label>
                <input 
                  type="email" 
                  className="input w-full" 
                  placeholder="Email" 
                  value={email} // ✅ Bind value
                  onChange={(e) => setEmail(e.target.value)} // ✅ Update state
                  required
                />

                <label className="label">Password</label>
                <input 
                  type="password" 
                  className="input w-full" 
                  placeholder="Password" 
                  value={password} // ✅ Bind value
                  onChange={(e) => setPassword(e.target.value)} // ✅ Update state
                  required
                />

                {/* Error Message Display */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div>
                  <a href="#" className="link link-hover text-sm">Forgot password?</a>
                </div>

                {/* Button type must be submit */}
                <button type="submit" className="btn btn-neutral mt-4 w-full">
                  Login
                </button>

              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}