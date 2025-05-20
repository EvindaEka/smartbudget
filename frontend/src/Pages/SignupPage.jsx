import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";

export default function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Tambahkan logika validasi & penyimpanan user di sini

    navigate("/login");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#38b6ff]">
      <div className="flex w-[800px] h-[450px] bg-[#38b6ff]">
        
        {/* Kiri - Logo */}
        <div className="flex items-center justify-center w-1/2">
          <img
            src={Logo}
            alt="Smart Budget Logo"
            className="w-[850px] h-auto ml-[-180px]"
          />
        </div>

        {/* Kanan - Form Sign Up */}
        <div className="w-[400px] h-[450px] bg-[#e4f3ff] rounded-xl px-6 py-6 flex flex-col items-center justify-start shadow-lg">
          <div className="w-full mt-2">
            <h1 className="text-3xl font-bold text-[#1c1e4e] mb-1 text-center">Sign Up</h1>
            <p className="text-center mb-4 text-sm text-[#444]">Create a new account</p>

            <form className="space-y-3" onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Jurusan"
                className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Universitas"
                className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
              >
                Sign Up
              </button>
            </form>

            <p className="text-xs text-center mt-2 text-[#1c1e4e]">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="underline cursor-pointer text-[#282f66] hover:text-[#1f254d]"
              >
                Login
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
