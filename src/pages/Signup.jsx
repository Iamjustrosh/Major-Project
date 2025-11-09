import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const { email, password, username } = formData;


    const { data: existingUser, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser?.user) {
      setMessage("This email is already registered. Try logging in instead.");
      return;
    }


    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signup successful! Please check your email for verification.");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Google signup error:', error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className='bg-[#00496E] w-200 h-200 lg:w-400 lg:h-400 blur-[200px] lg:blur-[500px] rounded-full absolute bottom-0  translate-y-1/2 '></div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/homepage")}
        className="absolute top-6 left-6 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      {/* Glass Form Container */}
      <div className="w-96 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center space-y-6">
        <h2 className="text-3xl font-semibold mb-2">Create Account</h2>
        <p className="text-gray-400 text-sm">Already Have Account? <span className="text-[#018FCC] hover:text-[#b8dfff]" onClick={() => navigate("/login")}>Log in</span> </p>

        <form onSubmit={handleSignup} className="flex flex-col w-full space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
          <button
            type="submit"
            className="bg-[#018FCC] hover:bg-blue-500 py-3 rounded-xl font-semibold transition-all"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p className="text-gray-300 text-sm text-center">{message}</p>
        )}
        <div className="flex items-center justify-center my-2 w-full">
          <div className="w-1/2 border-t border-gray-500"></div>
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="w-1/2 border-t border-gray-500"></div>
        </div>
        <button
          onClick={handleGoogleSignup}
          className="flex justify-center items-center gap-3 w-full mt-4 bg-white text-black font-medium py-2 rounded-xl hover:bg-gray-200 transition"
        >
          Continue with Google <SiGmail />

        </button>

      </div>
    </div>
  );
}

export default Signup
