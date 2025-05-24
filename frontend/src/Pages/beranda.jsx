import React, { useState, useEffect } from "react";
import { IoIosEye } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

// Asset imports
import ProfilIcon from "../assets/Profil_1.png";
import RpIcon from "../assets/Koin1.png";
import PengeluaranIcon from "../assets/Pengeluaran icon.png";
import PemasukanIcon from "../assets/Pemasukan Icon.png";

// Variants for slide animation
const pageVariants = {
  initial: { opacity: 0, y: -50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 50 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const Beranda = () => {
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pemasukanRes, pengeluaranRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/pemasukan/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/pengeluaran/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const pemasukanData = pemasukanRes.data.map((item) => ({
          id: item.id,
          type: "pemasukan",
          category: item.sumber,
          amount: item.jumlah,
          date: item.tanggal,
          icon: PemasukanIcon,
        }));

        const pengeluaranData = pengeluaranRes.data.map((item) => ({
          id: item.id,
          type: "pengeluaran",
          category: item.kategori,
          amount: item.jumlah,
          date: item.tanggal,
          icon: PengeluaranIcon,
        }));

        setTransactions([...pemasukanData, ...pengeluaranData]);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };

    fetchData();
  }, [token]);

  const totalPemasukan = transactions
    .filter((t) => t.type === "pemasukan")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.type === "pengeluaran")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;

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
      <div className="bg-[#0077b6] text-white w-full px-6 py-4 shadow-md z-50 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-3 z-10">
          <img src={ProfilIcon} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
          <div className="text-base font-semibold">Hai, Sahabat Smart</div>
        </div>

        <div className="flex gap-6 items-center">
          {[
            { path: "/beranda", label: "Beranda" },
            { path: "/pemasukan", label: "Pemasukan" },
            { path: "/pengeluaran", label: "Pengeluaran" },
            { path: "/analisis", label: "Analisis" },
            { path: "/setting", label: "Tentang" },
          ].map(({ path, label }) => (
            <span
              key={path}
              onClick={() => navigate(path)}
              className={`cursor-pointer hover:underline ${
                currentPath === path ? "underline font-bold" : ""
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Saldo */}
      <div className="mx-6 mt-6 mb-4 bg-white rounded-full px-6 py-2 flex justify-between items-center shadow">
        <div className="text-sm font-medium text-gray-800">Saldo uangmu</div>
        <div className="flex items-center gap-2">
          <span className="tracking-widest text-base font-bold">
            {showBalance ? totalSaldo.toLocaleString("id-ID") : "●●●●●●"}
          </span>
          <IoIosEye
            className="text-xl text-gray-700 cursor-pointer"
            onClick={() => setShowBalance(!showBalance)}
          />
          <img src={RpIcon} alt="Rp" className="w-5 h-5" />
        </div>
      </div>

      {/* Ringkasan */}
      <div className="mx-6 flex justify-between gap-4 mb-4">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-md text-center">
          <img
            src={PengeluaranIcon}
            alt="Pengeluaran"
            className="w-20 h-20 mx-auto mb-2 object-contain"
          />
          <div className="text-sm text-gray-700 font-medium">Pengeluaran</div>
          <div className="text-red-600 font-bold text-lg">
            {totalPengeluaran.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl p-4 shadow-md text-center">
          <img
            src={PemasukanIcon}
            alt="Pemasukan"
            className="w-20 h-20 mx-auto mb-2 object-contain"
          />
          <div className="text-sm text-gray-700 font-medium">Pemasukan</div>
          <div className="text-green-600 font-bold text-lg">
            {totalPemasukan.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="mx-6 bg-white rounded-2xl p-4 shadow-md relative flex-1 overflow-y-auto">
        {[...transactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map((tx) => (
            <div key={tx.id} className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <img src={tx.icon} alt={tx.category} className="w-8 h-8" />
                <div>
                  <div className="text-sm font-semibold text-[#1F77B4] bg-[#C5F1FF] inline-block px-3 py-1 rounded-full mb-1">
                    {tx.date}
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {tx.category}
                  </div>
                </div>
              </div>
              <div
                className={`font-bold text-base ${
                  tx.type === "pemasukan" ? "text-green-700" : "text-red-700"
                }`}
              >
                {tx.type === "pemasukan" ? "+" : "-"}
                {tx.amount.toLocaleString("id-ID")}
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
};

export default Beranda;