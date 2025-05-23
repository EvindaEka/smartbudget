import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import axios from "axios";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Email harus valid (mengandung '@' dan '.')");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password minimal 8 karakter, mengandung huruf dan angka");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

      const { access_token, user } = response.data;

      // Simpan token dan user ID ke localStorage atau context
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user.id_user);
      localStorage.setItem("user_name", user.nama);

      onLogin(); // Update state global (misalnya context) jika ada
      navigate("/beranda");
    } catch (error) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Terjadi kesalahan saat login. Coba lagi.");
      }
    }
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
            <h1 className="text-3xl font-bold text-[#1c1e4e] mb-1 text-center">Masuk</h1>
            <p className="text-center mb-4 text-sm text-[#444]">Masuk untuk melanjutkan</p>

            {error && (
              <div className="text-red-600 text-sm mb-3 text-center">{error}</div>
            )}

            <form className="space-y-3" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-5 py-4 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <input
                type="password"
                name="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-5 py-4 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
              >
                Masuk
              </button>
            </form>

            <p className="text-xs text-center mt-4 text-[#1c1e4e]">
              Belum punya akun?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="underline cursor-pointer text-[#282f66] hover:text-[#1f254d]"
              >
                Daftar
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}