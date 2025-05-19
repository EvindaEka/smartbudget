import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(); // Update state agar isLoggedIn = true
    navigate("/beranda"); // Arahkan ke halaman beranda
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#38b6ff]">
      <div className="flex w-[900px] h-[500px] overflow-hidden bg-[#38b6ff]">
        
        {/* Kiri - Logo */}
        <div className="w-1/2 !bg-[#38b6ff] flex items-center justify-center border-none shadow-none">
          <img src={Logo} alt="Smart Budget Logo" className="w-80 h-auto" />
        </div>

        {/* Kanan - Form */}
        <div className="w-1/2 bg-[#e4f3ff] flex items-center justify-center">
          <div className="w-[80%] max-w-md">
            <h1 className="text-4xl font-bold text-[#1c1e4e] mb-2 text-center">Login</h1>
            <p className="text-center mb-6 text-[#444]">Login to continue</p>
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
              >
                Login
              </button>
            </form>

            {/* Tambahkan link ke signup */}
            <p className="text-sm text-center mt-4 text-[#1c1e4e]">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="underline cursor-pointer text-[#282f66] hover:text-[#1f254d]"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
