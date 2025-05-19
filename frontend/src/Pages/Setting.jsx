import React from "react";
import { IoMdHome } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ProfilIcon from "../assets/profil.png"; 

const Setting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#92D5FF] text-black font-sans px-4 py-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src={ProfilIcon} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
          <div className="bg-[#C5F1FF] px-4 py-1 rounded-xl text-sm font-bold">
            Hai, Sahabat Smart
          </div>
        </div>
        <IoMdHome
          className="text-3xl text-black cursor-pointer"
          onClick={() => navigate("/beranda")}
        />
      </div>

      {/* Judul */}
      <h1 className="text-2xl font-extrabold text-center text-white mb-4">Informasi</h1>

      {/* Konten */}
      <div className="bg-white rounded-xl p-6 text-sm shadow-md leading-relaxed space-y-4">
        <div>
          <h2 className="text-base font-bold text-center mb-2">SmartBudget</h2>
          <h3 className="text-sm font-semibold text-center mb-4">
            Web Pengelola Keuangan Mahasiswa dengan Prediksi Pengeluaran
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
            <li>Pengekategorian Pengeluaran</li>
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
            Untuk informasi lebih lanjut, Anda dapat menghubungi tim pengembang melalui email: 
            <a href="mailto:email@example.com" className="text-blue-600"> email@example.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setting;
