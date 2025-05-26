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
        ] = await Promise.all([
          fetch("http://localhost:8000/dashboard/total", { headers }),
          fetch("http://localhost:8000/dashboard/total-pemasukan", { headers }),
          fetch("http://localhost:8000/user/saldo", { headers }),
          fetch("http://localhost:8000/dashboard/pengeluaran-per-kategori", {
            headers,
          }),
          fetch("http://localhost:8000/dashboard/pemasukan-per-sumber", {
            headers,
          }),
          fetch("http://localhost:8000/dashboard/prediksi-pengeluaran-total", {
            headers,
          }),
        ]);

        if (
          !pengeluaranRes.ok ||
          !pemasukanRes.ok ||
          !saldoRes.ok ||
          !kategoriRes.ok ||
          !pemasukanSumberRes.ok ||
          !prediksiTotalRes.ok
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
        ] = await Promise.all([
          pengeluaranRes.json(),
          pemasukanRes.json(),
          saldoRes.json(),
          kategoriRes.json(),
          pemasukanSumberRes.json(),
          prediksiTotalRes.json(),
        ]);

        const historiTotal = (prediksiTotalJson.data_aktual || []).map((h) => ({
          bulan: h.bulan,
          pengeluaran: h.pengeluaran,
        }));

        const prediksiTotal = prediksiTotalJson.prediksi_bulan_berikutnya
          ? [
              ...historiTotal,
              {
                bulan: prediksiTotalJson.prediksi_bulan_berikutnya.bulan,
                pengeluaran:
                  prediksiTotalJson.prediksi_bulan_berikutnya.pengeluaran,
              },
            ]
          : historiTotal;

        // --- FETCH PREDIKSI HISTORY PER KATEGORI ---
        const prediksiPerKategori = {};
        await Promise.all(
          CATEGORIES.map(async (kategori) => {
            try {
              const res = await fetch(
                `http://localhost:8000/dashboard/prediksi-pengeluaran-history?kategori=${encodeURIComponent(
                  kategori
                )}`,
                { headers }
              );
              if (!res.ok)
                throw new Error(`Gagal fetch prediksi histori kategori ${kategori}`);
              const json = await res.json();

              const histori = (json.data_aktual || []).map((h) => ({
                bulan: h.bulan,
                pengeluaran: h.pengeluaran,
              }));

              prediksiPerKategori[kategori] = json.prediksi_bulan_berikutnya
                ? [
                    ...histori,
                    {
                      bulan: json.prediksi_bulan_berikutnya.bulan,
                      pengeluaran:
                        json.prediksi_bulan_berikutnya.pengeluaran,
                    },
                  ]
                : histori;
            } catch (err) {
              console.warn(err);
              prediksiPerKategori[kategori] = [];
            }
          })
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
    return <div className="p-6 text-center text-gray-700">Sedang memuat data...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
        Dashboard Keuangan
      </h1>

      {/* Saldo */}
      <div className="bg-white p-6 rounded-lg shadow text-center w-full mb-6">
        <p className="text-gray-600 mb-2 text-xl font-medium">Saldo</p>
        <p className="text-green-600 text-4xl font-bold">
          Rp {data.saldo.toLocaleString("id-ID")}
        </p>
      </div>

      {/* Total Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pemasukan</p>
          <p className="text-blue-600 text-3xl font-bold">
            Rp {data.totalPemasukan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pengeluaran</p>
          <p className="text-red-500 text-3xl font-bold">
            Rp {data.totalPengeluaran.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.kategoriPengeluaran.map((entry, index) => (
                    <Cell
                      key={`cell-pie-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Tidak ada data kategori pengeluaran.</p>
          )}
        </div>

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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.pemasukanPerSumber.map((entry, index) => (
                    <Cell
                      key={`cell-pie-in-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Tidak ada data pemasukan.</p>
          )}
        </div>
      </div>

      {/* Grafik Total Pengeluaran & Prediksi */}
      <div className="bg-white p-6 rounded-lg shadow text-center mb-12">
        <p className="font-semibold mb-4 text-lg">
          Grafik Total Pengeluaran dan Prediksi
        </p>
        {data.prediksiTotal.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.prediksiTotal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pengeluaran" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Data prediksi tidak tersedia.</p>
        )}
      </div>

      {/* Grafik Prediksi Per Kategori */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Prediksi Pengeluaran per Kategori
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CATEGORIES.map((kategori, idx) => (
            <div
              key={`prediksi-kategori-${kategori}`}
              className="bg-white p-6 rounded-lg shadow text-center"
            >
              <p className="font-semibold mb-4">{kategori}</p>
              {data.prediksiPerKategori[kategori]?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.prediksiPerKategori[kategori]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pengeluaran"
                      stroke={COLORS[idx % COLORS.length]}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">Data prediksi tidak tersedia.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
