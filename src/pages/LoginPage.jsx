import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ No need to call setUser manually — onAuthStateChange in useAuthStore handles it
  // ✅ No need for useEffect redirect — AuthRoute in main.jsx handles it

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
    } else {
      // ✅ onAuthStateChange fires → sets user in store → AuthRoute redirects to /projects
      navigate("/projects");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setMessage("Google login failed: " + error.message);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage("Please enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setMessage(error ? error.message : "Check your email for a password reset link.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white bg-black">
      <div className="bg-[#00496E] w-200 h-200 lg:w-400 lg:h-400 blur-[200px] lg:blur-[500px] rounded-full absolute bottom-0 translate-y-1/2" />

      <button
        onClick={() => navigate("/homepage")}
        className="absolute top-6 left-6 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      <div className="w-96 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center space-y-6">
        <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <span
            className="text-[#018FCC] hover:text-[#b8dfff] cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>

        <form onSubmit={handleLogin} className="flex flex-col w-full space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-400 text-right mt-1">
            <span
              className="text-blue-500 hover:text-blue-400 cursor-pointer"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </span>
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#018FCC] hover:bg-blue-500 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </>
            ) : "Log In"}
          </button>
        </form>

        {message && (
          <p className="text-gray-300 text-sm text-center">{message}</p>
        )}

        <div className="flex items-center justify-center my-2 w-full">
          <div className="w-1/2 border-t border-gray-500" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="w-1/2 border-t border-gray-500" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex justify-center items-center gap-3 w-full mt-4 bg-white text-black font-medium py-2 rounded-xl hover:bg-gray-200 transition"
        >
          Continue with Google <SiGmail />
        </button>
      </div>
    </div>
  );
}

export default LoginPage;