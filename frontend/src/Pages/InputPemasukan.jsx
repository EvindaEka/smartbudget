import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconPemasukan from "../assets/pemasukaninput.png";
import BerandaIcon from "../assets/beranda.png";
import InputanPengeluaran from "../assets/pengeluaraninput.png";
import AnalisisIcon from "../assets/dashboard.png";
import koin from "../assets/koin.png";

export default function InputPemasukan({ onAddTransaction }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const formatNumber = (value) => {
    const numberString = value.replace(/\D/g, "");
    return numberString ? Number(numberString).toLocaleString("id-ID") : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? formatNumber(value) : value,
    }));
  };

  const handleSave = () => {
    const { category, amount, date } = formData;
    const numericAmount = parseInt(amount.replace(/\./g, ""));

    if (!category || !amount || !date || isNaN(numericAmount)) {
      alert("Semua field harus diisi dengan benar.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: "pemasukan",
      category,
      amount: numericAmount,
      date: new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      icon: IconPemasukan,
    };

    if (onAddTransaction) {
      onAddTransaction(newTransaction);
    }

    alert("Pemasukan berhasil disimpan!");
    navigate("/beranda");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-[FFFFFF] p-6 overflow-hidden">
      {/* Background koin */}
      <img
        src={koin}
        alt="koin-koin"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 animate-bintang z-0"
      />

      {/* Card Input */}
      <div className="relative w-full max-w-lg bg-white rounded-xl p-8 shadow-md z-10 mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Input Pemasukan</h2>

        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full mb-5 p-4 border rounded text-lg"
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
          name="amount"
          placeholder="Jumlah Saldo"
          value={formData.amount}
          onChange={handleInputChange}
          className="w-full mb-5 p-4 border rounded text-lg"
          inputMode="numeric"
        />

        <label className="block mb-2 font-semibold text-gray-700 text-lg">Tanggal</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full mb-6 p-4 border rounded text-lg"
          max={new Date().toISOString().slice(0, 10)}
        />

        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
        >
          Simpan
        </button>
      </div>

      {/* Navigasi bawah dengan teks */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#92D5FF] flex justify-around items-center py-3 rounded-t-3xl shadow-md z-20 text-[10px] sm:text-xs text-center">
        <div className="flex flex-col items-center">
          <img
            src={BerandaIcon}
            alt="Beranda"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/beranda" ? "opacity-50 filter grayscale" : ""
            }`}
            onClick={() => navigate("/beranda")}
          />
          <span className="mt-1">Beranda</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={IconPemasukan}
            alt="Pemasukan"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/pemasukan" ? "opacity-50 filter grayscale" : ""
            }`}
          />
          <span className="mt-1">Pemasukan</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={InputanPengeluaran}
            alt="Pengeluaran"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/pengeluaran" ? "opacity-50 filter grayscale" : ""
            }`}
            onClick={() => navigate("/pengeluaran")}
          />
          <span className="mt-1">Pengeluaran</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={AnalisisIcon}
            alt="Analisis"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/analisis" ? "opacity-50 filter grayscale" : ""
            }`}
            onClick={() => navigate("/analisis")}
          />
          <span className="mt-1">Analisis</span>
        </div>
      </div>
    </div>
  );
}
