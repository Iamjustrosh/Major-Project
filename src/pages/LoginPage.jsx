import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { SiGmail } from "react-icons/si";

function LoginPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) navigate("/projects"); // Redirect if already logged in
  }, [user]);

  // Handle Email Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setUser(data.user);
      navigate("/projects");
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Google login error:", error.message);
  };

  // Reset Password 
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage("Please enter your email first");
      return;
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: window.location.origin + "/reset-password",
        // Optional: custom page after password reset
      }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Check your email for a password reset link. Follow the instructions to reset your password."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white bg-black">
      <div className="bg-[#00496E] w-200 h-200 lg:w-400 lg:h-400 blur-[200px] lg:blur-[500px] rounded-full absolute bottom-0 translate-y-1/2"></div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/homepage")}
        className="absolute top-6 left-6 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      {/* Glass Container */}
      <div className="w-96 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center space-y-6">
        <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm">
          Don’t have an account?{" "}
          <span
            className="text-[#018FCC] hover:text-[#b8dfff] cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col w-full space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
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
            className="bg-[#018FCC] hover:bg-blue-500 py-3 rounded-xl font-semibold transition-all"
          >
            Log In
          </button>
        </form>

        {/* Error / Success Message */}
        {message && (
          <p className="text-gray-300 text-sm text-center">{message}</p>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center my-2 w-full">
          <div className="w-1/2 border-t border-gray-500"></div>
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="w-1/2 border-t border-gray-500"></div>
        </div>

        {/* Google Login */}
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
