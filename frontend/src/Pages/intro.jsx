import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import introImage from "../assets/Logo.svg"; 

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // ganti sesuai route Logo.jsx
    }, 5000); // 5000ms = 5 detik

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-[FFFFFF] p-6 overflow-hidden">
      <img
        src={introImage}
        alt="Smart Budget Intro"
        className="w-full max-w-xl animate-fade-in"
      />
    </div>
  );
}
