import React, { useState } from "react";
import { IoIosEye } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";

// Asset imports
import Setting from "../assets/Setting.png";
import RpIcon from "../assets/Koin1.png";
import PengeluaranIcon from "../assets/Pengeluaran icon.png";
import PemasukanIcon from "../assets/Pemasukan Icon.png";
import InputanPengeluaran from "../assets/pengeluaraninput.png";
import InputanPemasukan from "../assets/pemasukaninput.png";
import BerandaIcon from "../assets/beranda.png";
import AnalisisIcon from "../assets/dashboard.png";
import ProfilIcon from "../assets/profil.png";

const Beranda = () => {
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const totalSaldo = transactions.reduce((sum, t) => {
    return t.type === "pemasukan" ? sum + t.amount : sum - t.amount;
  }, 0);

  return (
    <div className="fixed inset-0 flex flex-col w-full h-screen overflow-hidden bg-gradient-to-b from-[#5DB7FF] to-[#A7DCFF] box-border">

      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4 w-full">
        <div className="flex items-center gap-2">
          <img src={ProfilIcon} alt="Profil" className="w-10 h-10 rounded-full object-cover" />
          <div className="bg-[#C5F1FF] px-4 py-1 rounded-xl text-l font-bold text-black">
            Hai, Sahabat Smart
          </div>
        </div>
        <img
          src={Setting}
          alt="Setting"
          className="w-6 h-6 cursor-pointer"
          onClick={() => currentPath !== "/setting" && navigate("/setting")}
        />
      </div>

      {/* Saldo */}
      <div className="mx-6 mb-4 bg-white rounded-full px-6 py-2 flex justify-between items-center shadow">
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
          <img src={PengeluaranIcon} alt="Pengeluaran" className="w-20 h-20 mx-auto mb-2 object-contain" />
          <div className="text-sm text-gray-700 font-medium">Pengeluaran</div>
          <div className="text-red-600 font-bold text-lg">
            {transactions
              .filter((t) => t.type === "pengeluaran")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl p-4 shadow-md text-center">
          <img src={PemasukanIcon} alt="Pemasukan" className="w-20 h-20 mx-auto mb-2 object-contain" />
          <div className="text-sm text-gray-700 font-medium">Pemasukan</div>
          <div className="text-green-600 font-bold text-lg">
            {transactions
              .filter((t) => t.type === "pemasukan")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="mx-6 bg-white rounded-2xl p-4 shadow-md relative flex-1 overflow-y-auto">
        {[...transactions].reverse().map((tx) => (
          <div key={tx.id} className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img src={tx.icon} alt={tx.category} className="w-6 h-6" />
              <div>
                <div className="text-xs font-semibold text-[#1F77B4] bg-[#C5F1FF] inline-block px-2 py-0.5 rounded-full mb-1">
                  {tx.date}
                </div>
                <div className="text-sm font-medium text-gray-800">{tx.category}</div>
              </div>
            </div>
            <div
              className={`${
                tx.type === "pemasukan" ? "text-green-600" : "text-red-600"
              } font-bold text-sm`}
            >
              {tx.type === "pemasukan" ? "+" : "-"}
              {tx.amount.toLocaleString("id-ID")}
            </div>
          </div>
        ))}
      </div>

      {/* Navigasi Bawah dengan Teks */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#92D5FF] flex justify-around items-center py-2 px-4 rounded-t-3xl shadow-md z-20 text-center text-[10px] sm:text-xs">
        <div className="flex flex-col items-center">
          <img
            src={BerandaIcon}
            alt="Beranda"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/beranda" ? "opacity-50 filter grayscale" : ""
            }`}
            onClick={() => currentPath !== "/beranda" && navigate("/beranda")}
          />
          <span className="mt-1">Beranda</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={InputanPemasukan}
            alt="Pemasukan"
            className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity ${
              currentPath === "/pemasukan" ? "opacity-50 filter grayscale" : ""
            }`}
            onClick={() => currentPath !== "/pemasukan" && navigate("/pemasukan")}
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
            onClick={() => currentPath !== "/pengeluaran" && navigate("/pengeluaran")}
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
            onClick={() => currentPath !== "/analisis" && navigate("/analisis")}
          />
          <span className="mt-1">Analisis</span>
        </div>
      </div>
    </div>
  );
};

export default Beranda;