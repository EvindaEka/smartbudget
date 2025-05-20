import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// Ganti path berikut dengan path aktual ikon kamu
import BerandaIcon from '../assets/beranda.png';
import PengeluaranIcon from "../assets/pengeluaraninput.png";
import PemasukanIcon from "../assets/pemasukaninput.png";
import AnalisisIcon from '../assets/dashboard.png';

const dataDonut = [
  { name: 'Kategori 1', value: 100 },
  { name: 'Kategori 2', value: 200 },
  { name: 'Kategori 3', value: 150 },
  { name: 'Kategori 4', value: 50 },
  { name: 'Kategori 5', value: 80 },
  { name: 'Kategori 6', value: 120 },
];

const dataPrediksi = {
  'Makanan dan Minuman': [
    { bulan: 'Jan', prediksi: 200 },
    { bulan: 'Feb', prediksi: 220 },
    { bulan: 'Mar', prediksi: 250 },
  ],
  'Sewa Kos': [
    { bulan: 'Jan', prediksi: 500 },
    { bulan: 'Feb', prediksi: 520 },
    { bulan: 'Mar', prediksi: 530 },
  ],
  'Transportasi': [
    { bulan: 'Jan', prediksi: 300 },
    { bulan: 'Feb', prediksi: 290 },
    { bulan: 'Mar', prediksi: 310 },
  ],
  'Kebutuhan Akademik': [
    { bulan: 'Jan', prediksi: 100 },
    { bulan: 'Feb', prediksi: 150 },
    { bulan: 'Mar', prediksi: 130 },
  ],
};

const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#8884d8', '#8dd1e1', '#a4de6c'];

const Analisis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="bg-blue-200 min-h-screen p-6 pb-24 font-sans relative">
      {/* Header */}
      <div className="text-center text-3xl font-bold mb-6">Dashboard Pengeluaran</div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center shadow">
          <p className="text-gray-600">Total Pengeluaran</p>
          <p className="text-red-500 text-2xl font-bold">500.000</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow">
          <p className="text-gray-600">Saldo</p>
          <p className="text-green-600 text-2xl font-bold">1.000.000</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-center mb-2 font-semibold">Pengeluaran per kategori</p>
          <PieChart width={200} height={200}>
            <Pie data={dataDonut} cx="50%" cy="50%" outerRadius={70} dataKey="value">
              {dataDonut.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-center mb-2 font-semibold">Pemasukan</p>
          <PieChart width={200} height={200}>
            <Pie data={dataDonut} cx="50%" cy="50%" outerRadius={70} dataKey="value">
              {dataDonut.map((entry, index) => (
                <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>

      {/* Grafik Prediksi */}
      <div className="bg-white rounded-xl p-6 shadow">
        <p className="text-xl font-semibold mb-4">Prediksi Pengeluaran per Kategori </p>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(dataPrediksi).map(([kategori, data]) => (
            <div key={kategori} className="bg-blue-50 p-4 rounded shadow">
              <p className="font-medium mb-2 text-center">{kategori}</p>
              <LineChart width={300} height={200} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="prediksi" stroke="#8884d8" />
              </LineChart>
            </div>
          ))}
        </div>
      </div>

{/* Navigasi Bawah */}
<div className="fixed bottom-0 left-0 right-0 bg-[#92D5FF] flex justify-around items-center py-3 rounded-t-3xl shadow-md z-20 text-[10px] sm:text-xs text-center">
  <div className="flex flex-col items-center">
    <img
      src={BerandaIcon}
      alt="Beranda"
      className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity"
      onClick={() => navigate("/beranda")}
    />
    <span className="mt-1">Beranda</span>
  </div>

  <div className="flex flex-col items-center">
    <img
      src={PemasukanIcon}
      alt="Pemasukan"
      className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity"
      onClick={() => navigate("/pemasukan")}
    />
    <span className="mt-1">Pemasukan</span>
  </div>

  <div className="flex flex-col items-center">
    <img
      src={PengeluaranIcon}
      alt="Pengeluaran"
      className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer object-contain transition-opacity"
      onClick={() => navigate("/pengeluaran")}
    />
    <span className="mt-1">Pengeluaran</span>
  </div>

  <div className="flex flex-col items-center">
    <img
      src={AnalisisIcon}
      alt="Analisis"
      className="w-6 h-6 sm:w-8 sm:h-8 object-contain opacity-50 grayscale"
    />
    <span className="mt-1 text-black">Analisis</span>
  </div>
</div>
    </div>
  );
}   
export default Analisis;
