// Dashboard.jsx

import React, { useEffect, useState } from "react";
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

export default function Dashboard() {
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

  if (loading) return <div className="p-6 text-center text-gray-700">Sedang memuat data...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow text-center w-full mb-6">
        <p className="text-gray-600 mb-2 text-xl font-medium">Saldo</p>
        <p className="text-green-600 text-4xl font-bold">{formatRupiah(data.saldo)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pemasukan</p>
          <p className="text-blue-600 text-3xl font-bold">{formatRupiah(data.totalPemasukan)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pengeluaran</p>
          <p className="text-red-500 text-3xl font-bold">{formatRupiah(data.totalPengeluaran)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* PieChart Pengeluaran */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Pengeluaran per Kategori</p>
          {data.kategoriPengeluaran.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.kategoriPengeluaran}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.kategoriPengeluaran.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Tidak ada data kategori pengeluaran.</p>
          )}
        </div>

        {/* PieChart Pemasukan */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Pemasukan per Sumber</p>
          {data.pemasukanPerSumber.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.pemasukanPerSumber}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.pemasukanPerSumber.map((entry, index) => (
                    <Cell key={`cell-pie-in-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Tidak ada data pemasukan.</p>
          )}
        </div>
      </div>

      {/* Grafik Total dan Prediksi */}
      <div className="bg-white p-6 rounded-lg shadow text-center mb-12">
        <p className="font-semibold mb-4 text-lg">Grafik Total Pengeluaran dan Prediksi</p>
        {data.prediksiTotal.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.prediksiTotal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis tickFormatter={(value) => value.toLocaleString("id-ID")} />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                stroke="#8884d8"
                dot={(dotProps) => (
                  <CustomizedDot {...dotProps} data={data.prediksiTotal} stroke="#8884d8" />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Tidak ada data prediksi total pengeluaran.</p>
        )}
      </div>

      {/* Grafik per Kategori */}
<div className="mb-12">
  <p className="font-semibold mb-4 text-lg text-center">
    Grafik Prediksi Pengeluaran per Kategori
  </p>
  {Object.keys(data.prediksiPerKategori).length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {CATEGORIES.map((kategori, idx) => (
        <div
          key={kategori}
          className={`bg-white p-6 rounded-lg shadow ${
            kategori === "Lainnya" ? "md:col-span-2" : ""
          }`}
        >
          <p className="font-semibold mb-4">{kategori}</p>
          {data.prediksiPerKategori[kategori].length > 0 ? (
            <ResponsiveContainer width="100%" height={kategori === "Lainnya" ? 300 : 250}>
              <LineChart data={data.prediksiPerKategori[kategori]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis tickFormatter={(value) => value.toLocaleString("id-ID")} />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Line
                  type="monotone"
                  dataKey="pengeluaran"
                  stroke={COLORS[idx % COLORS.length]}
                  dot={(dotProps) => (
                    <CustomizedDot
                      {...dotProps}
                      data={data.prediksiPerKategori[kategori]}
                      stroke={COLORS[idx % COLORS.length]}
                    />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Tidak ada data prediksi kategori ini.</p>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-500">
      Tidak ada data prediksi per kategori.
    </p>
  )}
</div>


      {/* Grafik Kos & Internet */}
      <div>
        <p className="font-semibold mb-4 text-lg text-center">
          Pengeluaran Bulanan Kos dan Internet
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="font-semibold mb-4">Pengeluaran Kos Bulanan</p>
            {pengeluaranKos.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={pengeluaranKos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={(value) => value.toLocaleString("id-ID")} />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Line type="monotone" dataKey="total" stroke="#FF8042" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">Tidak ada data pengeluaran kos.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="font-semibold mb-4">Pengeluaran Paket Internet Bulanan</p>
            {pengeluaranInternet.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={pengeluaranInternet}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={(value) => value.toLocaleString("id-ID")} />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Line type="monotone" dataKey="total" stroke="#00C49F" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">Tidak ada data pengeluaran internet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
