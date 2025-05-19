import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconPemasukan from "../assets/ikon pemasukan.png";
import BerandaIcon from "../assets/Beranda.png";
import InputanPengeluaran from "../assets/Pengeluaran icon inputan.png";
import AnalisisIcon from "../assets/Analisis.png";
import bintang from "../assets/bintangbintang.svg"; // ✅ IMPORT langsung dari src/assets

export default function InputPemasukan({ onAddTransaction }) {
  const navigate = useNavigate();
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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#01204E] via-[#028391] to-[#A7DCFF] p-6 overflow-hidden">
      {/* Background bintang */}
      <img
        src={bintang}
        alt="bintang-bintang"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 animate-bintang z-0"
      />

      {/* Card Input */}
      <div className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-md z-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Input Pemasukan</h2>

        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded"
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
          className="w-full mb-4 p-2 border rounded"
          inputMode="numeric"
        />

        <label className="block mb-2 font-semibold text-gray-700">Tanggal</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full mb-6 p-2 border rounded"
          max={new Date().toISOString().slice(0, 10)}
        />

        <button
          onClick={handleSave}
          className="w-full py-2 bg-[#282f66] text-white font-bold rounded-md hover:bg-[#1f254d] transition-colors duration-300 !text-white !bg-[#282f66] !opacity-100"
        >
          Simpan
        </button>
      </div>

      {/* Navigasi bawah */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#92D5FF] flex justify-around items-center py-3 rounded-t-3xl shadow-md z-20">
        <img
          src={BerandaIcon}
          alt="Beranda"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/beranda")}
        />
        <img
          src={IconPemasukan}
          alt="Input Pemasukan"
          className="w-15 h-15 cursor-pointer opacity-50"
        />
        <img
          src={InputanPengeluaran}
          alt="Input Pengeluaran"
          className="w-12 h-12 cursor-pointer"
          onClick={() => navigate("/pengeluaran")}
        />
        <img
          src={AnalisisIcon}
          alt="Analisis"
          className="w-12 h-12 cursor-pointer"
          onClick={() => navigate("/analisis")}
        />
      </div>
    </div>
  );
}
