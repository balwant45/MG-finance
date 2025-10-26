import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { logIn } from "../../utils/authSlice";

export default function LogIn() {
  const dispatch = useDispatch();
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await axios.get("https://api.quotable.io/random");
        setQuote(response.data.content);
        setAuthor(response.data.author);
        console.log("Quote response:", response.data);

      } catch (error) {
        console.error("Error fetching quote:", error.message);
      }
    }

    fetchQuote();
  }, []);

  const handleLogin = () => {
    dispatch(logIn({ name: "balwant" })); // try without info later
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Welcome Back!</h1>
          <p className="py-6 text-lg italic">
            {quote}<br />
            <span className="font-semibold">— {author}</span>
          </p>
        </div>
        <div className="card bg-base-100 w-fit max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <fieldset className="fieldset">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="Email" />
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Password" />
              <div>
                <a className="link link-hover">Forgot password?</a>
              </div>
              <button className="btn btn-neutral mt-4" onClick={()=>handleLogin()}>
                Login
              </button>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
