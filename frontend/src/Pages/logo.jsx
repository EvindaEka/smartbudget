import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
    navigate("/beranda");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#38b6ff]">
      <div className="flex w-[800px] h-[450px] bg-[#38b6ff]">
        
        {/* Kiri - Logo */}
        <div className="flex items-center justify-center w-1/2">
          <img
            src={Logo}
            alt="Smart Budget Logo"
            className="w-[450px] h-auto ml-[-180px]"
          />
        </div>

        {/* Kanan - Form Login */}
        <div className="w-[400px] h-[450px] bg-[#e4f3ff] rounded-xl px-6 py-6 flex flex-col items-center justify-start shadow-lg">
          <div className="w-full mt-4">
            <h1 className="text-3xl font-bold text-[#1c1e4e] mb-1 text-center">Login</h1>
            <p className="text-center mb-4 text-sm text-[#444]">Login to continue</p>

            <form className="space-y-3" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-5 py-4 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-5 py-4 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
              >
                Login
              </button>
            </form>

            <p className="text-xs text-center mt-4 text-[#1c1e4e]">
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
