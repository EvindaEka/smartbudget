import React from "react";
import { useNavigate } from "react-router-dom";
import introImage from "../assets/Logo.svg";

const floatKeyframes = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }
`;

const floatAnimation = {
  animation: "float 3s ease-in-out infinite",
};

export default function Intro() {
  const navigate = useNavigate();

  return (
    <>
      {/* Inject keyframes CSS */}
      <style>{floatKeyframes}</style>

      {/* Navbar */}
      <nav
        className="shadow-md fixed top-0 left-0 w-full z-50"
        style={{ backgroundColor: "#0077b6" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo navbar (tidak bergerak) */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-white cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          >
            Smart Budget
          </div>

          {/* Menu */}
          <div className="space-x-6 font-medium hidden md:flex">
            <div
              onClick={() => navigate("/")}
              className="text-white hover:text-gray-300 cursor-pointer select-none"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/");
              }}
            >
              Beranda
            </div>
            <div
              onClick={() => navigate("/setting")}
              className="text-white hover:text-gray-300 cursor-pointer select-none"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/setting");
              }}
            >
              Tentang
            </div>
            <div
              onClick={() => navigate("/login")}
              className="text-white hover:text-gray-300 cursor-pointer select-none"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/login");
              }}
            >
              Masuk
            </div>
            <div
              onClick={() => navigate("/signup")}
              className="text-white hover:text-gray-300 cursor-pointer select-none"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/signup");
              }}
            >
              Daftar
            </div>
          </div>
        </div>
      </nav>

      {/* Intro Content */}
      <div
        className="pt-24 min-h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white flex items-center justify-center px-6"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between">
          {/* Left Text */}
          <div className="text-center md:text-left max-w-xl pl-20 md:pl-0 md:ml-25">
            <h1
              className="text-5xxl font-bold text-gray-800 mb-4 font-alfa slab one"
              style={floatAnimation}
            >
              Smart Budget
            </h1>
            <p
              className="text-2xl text-gray-700 mb-6 font-alfa slab one"
              style={floatAnimation}
            >
              Kelola Keuangan Anda dengan Cerdas dan Mudah
            </p>
          </div>

          {/* Right Image */}
          <div className="mt-10 md:mt-0 md:ml-12">
            <img
              src={introImage}
              alt="Smart Budget Illustration"
              className="w-full"
              style={{ maxWidth: "700px", ...floatAnimation }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
