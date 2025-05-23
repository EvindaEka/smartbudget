import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ProfilIcon from "../assets/Profil_1.png";

// Variants untuk animasi slide
const pageVariants = {
  initial: {
    opacity: 0,
    y: -50, // dari atas ke bawah
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: 50, // keluar ke bawah
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const Setting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white text-black font-sans flex flex-col"
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
              className={`cursor-pointer hover:underline ${currentPath === path ? "underline font-bold" : ""}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Konten */}
      <div className="px-6 py-6 flex-grow">
        <h1 className="text-2xl font-extrabold text-center text-white mb-4">Informasi</h1>

        <div className="bg-white rounded-xl p-6 text-sm shadow-md leading-relaxed space-y-4">
          <div>
            <h2 className="text-base font-bold text-center mb-2">SmartBudget</h2>
            <h3 className="text-sm font-semibold text-center mb-4">
              Web Perencanaan Keuangan Mahasiswa dengan Prediksi Pengeluaran
            </h3>
            <p>
              SmartBudget adalah aplikasi web yang dirancang untuk membantu mahasiswa mengelola keuangan mereka
              dengan lebih efektif. Aplikasi ini menyediakan berbagai fitur yang memungkinkan pengguna untuk
              mencatat pemasukan, pengeluaran, dan memprediksi pengeluaran di masa depan. Dengan memanfaatkan
              teknologi machine learning, SmartBudget dapat menganalisis pola pengeluaran pengguna dan memberikan
              pengalaman pengguna yang lebih baik dalam mencatat dan memantau transaksi keuangan.
            </p>
          </div>

          <div>
            <h4 className="font-bold">Fitur Utama</h4>
            <ol className="list-decimal ml-5">
              <li>Pencatatan Pemasukan dan Pengeluaran</li>
              <li>Pengkategorian Pengeluaran</li>
              <li>Visualisasi Data</li>
              <li>Real-time Updates</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold">Manfaat</h4>
            <ol className="list-decimal ml-5">
              <li>Meningkatkan Kesadaran Mahasiswa akan Keterampilan Mengelola Keuangan Pribadi</li>
              <li>Membantu Mahasiswa Menghindari Kebiasaan Uang sebelum Akhir Bulan</li>
              <li>Mempermudah Mahasiswa dalam Merencanakan Anggaran Keuangan Mereka</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold">Tim Pengembang</h4>
            <p>
              Aplikasi ini dikembangkan oleh tim dari Program Studi D4 Sains Data Terapan, Departemen Teknik
              Informatika dan Komputer, Politeknik Elektronika Negeri Surabaya:
            </p>
            <ul className="list-disc ml-5">
              <li>Aurelia Hapsari Dyah Rinjani (3323600035)</li>
              <li>Evinda Eka Ayudia Lestari (3323600039)</li>
              <li>R.Aj Maria Shovia Fadinda (3323600059)</li>
            </ul>
            <p className="mt-2">Dosen Pembimbing: Yesta Medya Mahardhika S.Tr.Kom., M.T.</p>
          </div>

          <div>
            <h4 className="font-bold">Informasi Lebih Lanjut</h4>
            <p>
              Untuk informasi lebih lanjut, Anda dapat menghubungi tim pengembang melalui email:{" "}
              <a href="mailto:email@example.com" className="text-blue-600">email@example.com</a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Setting;
