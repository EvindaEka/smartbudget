// Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ProfilIcon from "../assets/Profil_1.png"; // Ganti dengan path sebenarnya

const COLORS = ["#FFBB28", "#00C49F", "#FF8042", "#8884d8", "#8dd1e1", "#a4de6c"];
const CATEGORIES = [
  "Makanan dan Minuman",
  "Transportasi",
  "Kebutuhan Akademik",
  "Kesehatan",
  "Lainnya",
];

function formatRupiah(angka) {
  if (angka === null || angka === undefined) return "Rp 0";
  const number = Math.floor(angka);
  return "Rp " + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const CustomizedDot = (props) => {
  const { cx, cy, index, data, stroke } = props;
  if (index === data.length - 1) {
    return (
      <circle cx={cx} cy={cy} r={6} stroke="#FF0000" strokeWidth={2} fill="#fff" />
    );
  }
  return (
    <circle cx={cx} cy={cy} r={3} stroke={stroke} strokeWidth={1} fill={stroke} />
  );
};

// HAPUS komponen Navbar sebelumnya

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalPengeluaran: 0,
    totalPemasukan: 0,
    saldo: 0,
    kategoriPengeluaran: [],
    pemasukanPerSumber: [],
    prediksiTotal: [],
    prediksiPerKategori: {},
  });
  const [pengeluaranKos, setPengeluaranKos] = useState([]);
  const [pengeluaranInternet, setPengeluaranInternet] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Kamu belum login. Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [
          pengeluaranRes,
          pemasukanRes,
          saldoRes,
          kategoriRes,
          pemasukanSumberRes,
          prediksiTotalRes,
          kosInternetRes,
        ] = await Promise.all([
          fetch("http://localhost:8000/dashboard/total", { headers }),
          fetch("http://localhost:8000/dashboard/total-pemasukan", { headers }),
          fetch("http://localhost:8000/user/saldo", { headers }),
          fetch("http://localhost:8000/dashboard/pengeluaran-per-kategori", { headers }),
          fetch("http://localhost:8000/dashboard/pemasukan-per-sumber", { headers }),
          fetch("http://localhost:8000/dashboard/prediksi-pengeluaran-total", { headers }),
          fetch("http://localhost:8000/pengeluaran/kos-dan-internet-bulanan", { headers }),
        ]);

        if (
          !pengeluaranRes.ok ||
          !pemasukanRes.ok ||
          !saldoRes.ok ||
          !kategoriRes.ok ||
          !pemasukanSumberRes.ok ||
          !prediksiTotalRes.ok ||
          !kosInternetRes.ok
        ) {
          throw new Error("Gagal mengambil salah satu data utama dari server.");
        }

        const [
          totalPengeluaranData,
          totalPemasukanData,
          saldoData,
          kategoriData,
          pemasukanData,
          prediksiTotalJson,
          kosInternetJson,
        ] = await Promise.all([
          pengeluaranRes.json(),
          pemasukanRes.json(),
          saldoRes.json(),
          kategoriRes.json(),
          pemasukanSumberRes.json(),
          prediksiTotalRes.json(),
          kosInternetRes.json(),
        ]);

        const historiTotal = (prediksiTotalJson.data_aktual || []).map((h) => ({
          bulan: h.bulan,
          pengeluaran: Math.floor(h.pengeluaran),
        }));

        const prediksiTotal = prediksiTotalJson.prediksi_bulan_berikutnya
          ? [
              ...historiTotal,
              {
                bulan: prediksiTotalJson.prediksi_bulan_berikutnya.bulan,
                pengeluaran: Math.floor(prediksiTotalJson.prediksi_bulan_berikutnya.pengeluaran),
              },
            ]
          : historiTotal;

        const prediksiPerKategori = {};
        await Promise.all(
          CATEGORIES.map(async (kategori) => {
            try {
              const res = await fetch(
                `http://localhost:8000/dashboard/prediksi-pengeluaran-history?kategori=${encodeURIComponent(kategori)}`,
                { headers }
              );
              if (!res.ok) throw new Error(`Gagal fetch prediksi histori kategori ${kategori}`);
              const json = await res.json();

              const histori = (json.data_aktual || []).map((h) => ({
                bulan: h.bulan,
                pengeluaran: Math.floor(h.pengeluaran),
              }));

              prediksiPerKategori[kategori] = json.prediksi_bulan_berikutnya
                ? [
                    ...histori,
                    {
                      bulan: json.prediksi_bulan_berikutnya.bulan,
                      pengeluaran: Math.floor(json.prediksi_bulan_berikutnya.pengeluaran),
                    },
                  ]
                : histori;
            } catch (err) {
              console.warn(err);
              prediksiPerKategori[kategori] = [];
            }
          })
        );

        const formatToLabel = (d) =>
          `${d.bulan.toString().padStart(2, "0")}/${d.tahun}`;

        setPengeluaranKos(
          (kosInternetJson.kos || []).map((item) => ({
            bulan: formatToLabel(item),
            total: Math.floor(item.total),
          }))
        );

        setPengeluaranInternet(
          (kosInternetJson["paket internet"] || []).map((item) => ({
            bulan: formatToLabel(item),
            total: Math.floor(item.total),
          }))
        );

        setData({
          totalPengeluaran: totalPengeluaranData.total || 0,
          totalPemasukan: totalPemasukanData.total || 0,
          saldo: saldoData.saldo || 0,
          kategoriPengeluaran: (kategoriData || []).map((item) => ({
            name: item.kategori,
            value: item.total,
          })),
          pemasukanPerSumber: (pemasukanData || []).map((item) => ({
            name: item.sumber,
            value: item.total,
          })),
          prediksiTotal,
          prediksiPerKategori,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-700">Sedang memuat data...</div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600">Error: {error}</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white p-6 pt-20 font-sans">
      {/* Navbar */}
      <div className="bg-[#0077b6] text-white w-full px-6 py-4 shadow-md z-50 flex justify-between items-center text-sm font-medium fixed top-0 left-0">
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

      <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
        Dashboard
      </h1>

      <div className="bg-white p-6 rounded-lg shadow text-center w-full mb-6">
        <p className="text-gray-600 mb-2 text-xl font-medium">Saldo</p>
        <p className="text-green-600 text-4xl font-bold">
          {formatRupiah(data.saldo)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pemasukan</p>
          <p className="text-blue-600 text-3xl font-bold">
            {formatRupiah(data.totalPemasukan)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pengeluaran</p>
          <p className="text-red-500 text-3xl font-bold">
            {formatRupiah(data.totalPengeluaran)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* PieChart Pengeluaran */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Pengeluaran per Kategori</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.kategoriPengeluaran}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.kategoriPengeluaran.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart Pemasukan */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Pemasukan per Sumber</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.pemasukanPerSumber}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.pemasukanPerSumber.map((entry, index) => (
                  <Cell
                    key={`cell-pemasukan-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Prediksi Total Pengeluaran */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Prediksi Total Pengeluaran per Bulan
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.prediksiTotal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000
                  ? `Rp${(value / 1000).toFixed(0)}K`
                  : `Rp${value}`
              }
            />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="pengeluaran"
              stroke="#FF7300"
              dot={<CustomizedDot data={data.prediksiTotal} />}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Prediksi per Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {CATEGORIES.map((kategori) => (
          <div key={kategori} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">{kategori}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={data.prediksiPerKategori[kategori] || []}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `Rp${(value / 1000).toFixed(0)}K`
                      : `Rp${value}`
                  }
                />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pengeluaran"
                  stroke="#8884d8"
                  dot={<CustomizedDot data={data.prediksiPerKategori[kategori] || []} />}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Grafik Pengeluaran Kos dan Internet */}
      <div className="bg-white p-6 rounded-lg shadow mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Pengeluaran Kos dan Paket Internet per Bulan
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={pengeluaranKos.map((item, idx) => ({
              ...item,
              internet: pengeluaranInternet[idx]?.total || 0,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000
                  ? `Rp${(value / 1000).toFixed(0)}K`
                  : `Rp${value}`
              }
            />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Kos" />
            <Line type="monotone" dataKey="internet" stroke="#8884d8" name="Internet" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
