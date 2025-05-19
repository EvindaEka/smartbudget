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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#01204E] via-[#028391] to-[#A7DCFF]">
      <img
        src={introImage}
        alt="Smart Budget Intro"
        className="w-full max-w-sm animate-fade-in"
      />
    </div>
  );
}
