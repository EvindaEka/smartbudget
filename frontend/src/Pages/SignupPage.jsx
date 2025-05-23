import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/Logo.svg";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    jurusan: "",
    universitas: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    const { nama, email, password, jurusan, universitas } = formData;

    if (!nama || !email || !password || !jurusan || !universitas) {
      return "Semua field wajib diisi.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email harus valid (mengandung '@' dan '.')";
    }

    if (password.length < 8) {
      return "Password minimal 8 karakter.";
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return "Password harus mengandung huruf dan angka.";
    }

    return null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/auth/register", formData);
      console.log("Register success:", response.data);
      setSuccess("Registrasi berhasil! Silakan login.");
      setFormData({
        nama: "",
        email: "",
        password: "",
        jurusan: "",
        universitas: "",
      });
      setTimeout(() => navigate("/login"), 1500); // Redirect setelah 1.5 detik
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Terjadi kesalahan saat mendaftar.");
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white flex items-center justify-start gap-8 px-6 pl-35 flex-wrap">
      <div className="flex items-center justify-center">
        <img src={Logo} alt="Smart Budget Logo" className="w-[500px] h-auto" />
      </div>

      <div className="w-[400px] bg-[#e4f3ff] rounded-xl px-6 py-6 flex flex-col items-center justify-start shadow-lg">
        <div className="w-full mt-2">
          <h1 className="text-3xl font-bold text-[#1c1e4e] mb-1 text-center">Daftar</h1>
          <p className="text-center mb-4 text-sm text-[#444]">Buat akun baru</p>

          {error && <div className="text-red-600 text-sm mb-3 text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-3 text-center">{success}</div>}

          <form className="space-y-3" onSubmit={handleSignup}>
            <input
              type="text"
              name="nama"
              placeholder="Username"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
            />
            <input
              type="text"
              name="jurusan"
              placeholder="Jurusan"
              value={formData.jurusan}
              onChange={handleChange}
              className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
            />
            <input
              type="text"
              name="universitas"
              placeholder="Universitas"
              value={formData.universitas}
              onChange={handleChange}
              className="w-full px-5 py-2 rounded bg-[#a8ddf0] text-[#282f66] placeholder-[#282f66] outline-none text-sm"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
            >
              Daftar
            </button>
          </form>

          <p className="text-xs text-center mt-2 text-[#1c1e4e]">
            Sudah punya akun?{" "}
            <span
              onClick={() => navigate("/login")}
              className="underline cursor-pointer text-[#282f66] hover:text-[#1f254d]"
            >
              Masuk
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}