import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#8884d8', '#8dd1e1', '#a4de6c'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading data...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#5DB7FF] via-[#A7DCFF] to-white overflow-hidden p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Dashboard Pengeluaran</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Total Pengeluaran</p>
          <p className="text-red-500 text-3xl font-bold">{data.totalPengeluaran.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-2">Saldo</p>
          <p className="text-green-600 text-3xl font-bold">{data.saldo.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Pengeluaran per Kategori</p>
          <PieChart width={250} height={250}>
            <Pie
              data={data.kategoriPengeluaran}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.kategoriPengeluaran.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="font-semibold mb-4">Prediksi Pengeluaran per Kategori</p>
          {Object.entries(data.prediksi).map(([kategori, points]) => (
            <div key={kategori} className="mb-8">
              <h3 className="font-medium mb-2">{kategori}</h3>
              <LineChart width={300} height={180} data={points}>
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
    </div>
  );
}
