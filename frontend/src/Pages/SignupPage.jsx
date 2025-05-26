import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconPemasukan from "../assets/pemasukaninput.png";
import ProfilIcon from "../assets/Profil_1.png";
import koin from "../assets/koin.png";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const pageVariants = {
  initial: { opacity: 0, y: -50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 50 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.5,
};

export default function InputPemasukan({ onAddTransaction }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [formData, setFormData] = useState({
    sumber: "",
    jumlah: "",
    tanggal: new Date().toISOString().slice(0, 10),
  });

  const formatRupiah = (value) => {
    const numberString = value.replace(/\D/g, "");
    return numberString ? Number(numberString).toLocaleString("id-ID") : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "jumlah" ? formatRupiah(value) : value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Anda belum login.");
      return;
    }

    const numericJumlah = parseInt(formData.jumlah.replace(/\./g, ""));
    if (!formData.sumber || isNaN(numericJumlah) || numericJumlah <= 0) {
      toast.error("Mohon isi semua field dengan benar.");
      return;
    }

    const payload = {
      sumber: formData.sumber,
      jumlah: numericJumlah,
      tanggal: formData.tanggal,
    };

    try {
      const res = await axios.post("http://localhost:8000/pemasukan/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Pemasukan berhasil disimpan!");

      if (onAddTransaction) {
        onAddTransaction({ ...res.data, icon: IconPemasukan });
      }

      navigate("/beranda");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal menyimpan pemasukan.");
    }
  };

  return (
    <motion.div
      className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Navbar */}
      <div className="bg-[#0077b6] text-white w-full px-6 py-4 shadow-md z-10 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-3">
          <img src={ProfilIcon} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
          <div className="text-base font-semibold">Hai, Sahabat Smart</div>
        </div>
        <div className="flex gap-6 items-center text-white">
          {["beranda", "pemasukan", "pengeluaran", "analisis", "setting"].map((path) => (
            <span
              key={path}
              onClick={() => navigate(`/${path}`)}
              className={`cursor-pointer hover:underline ${
                currentPath === `/${path}` ? "underline font-bold" : ""
              }`}
            >
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Background */}
      <img
        src={koin}
        alt="koin-koin"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 animate-bintang z-0"
      />

      {/* Form */}
      <div className="relative w-full max-w-xl bg-white rounded-xl p-6 shadow-md z-10 mb-20 mx-auto mt-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Pemasukan</h2>

        <select
          name="sumber"
          value={formData.sumber}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded text-lg"
        >
          <option value="" disabled>
            Pilih Kategori Pemasukan
          </option>
          <option value="Uang saku orangtua">Uang saku orangtua</option>
          <option value="Gaji/upah">Gaji/upah</option>
          <option value="Beasiswa">Beasiswa</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <input
          type="text"
          name="jumlah"
          placeholder="Jumlah Saldo"
          value={formData.jumlah}
          onChange={handleInputChange}
          className="w-full mb-5 p-4 border rounded text-lg"
          inputMode="numeric"
        />

        <label className="block mb-2 font-semibold text-gray-700 text-lg">Tanggal</label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded text-lg"
          max={new Date().toISOString().slice(0, 10)}
        />

        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
        >
          Simpan
        </button>
      </div>
    </motion.div>
  );
}