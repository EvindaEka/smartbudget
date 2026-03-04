# 💰 SmartBudget
SmartBudget adalah aplikasi web pencatatan keuangan mahasiswa yang membantu mencatat pemasukan dan pengeluaran harian serta menampilkan prediksi pengeluaran bulanan untuk mendukung perencanaan finansial yang lebih baik.

---

## Fitur
* Login & Register
* Input pemasukan dan pengeluaran harian
* Perhitungan saldo otomatis
* Dashboard ringkasan keuangan
* Visualisasi distribusi pengeluaran
* Prediksi pengeluaran bulanan (total & per kategori)

---

## Tech Stack
### Backend
* FastAPI
* PostgreSQL

### Frontend
* ReactJS

### Model & Analisis Data
* ARIMA
* Holt-Winters
* Clustering

---

## ⚙️ Cara Menjalankan
### 1. Clone Repository
```bash
git clone https://github.com/EvindaEka/smartbudget.git
cd smartbudget
```

### 2. Jalankan Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Akses API:
`http://127.0.0.1:8000/docs`

### 3. Jalankan Frontend
```bash
cd frontend
npm install
npm start
```

Frontend berjalan di:
`http://localhost:3000`

---

## Tujuan
Membantu mahasiswa mengelola keuangan secara lebih terstruktur dan berbasis data melalui pencatatan dan prediksi pengeluaran.

---

## Tim Pengembang
Aplikasi ini dikembangkan oleh tim dari Program Studi D4 Sains Data Terapan, Departemen Teknik Informatika dan Komputer, Politeknik Elektronika Negeri Surabaya:

1. Aurelia Hapsari Dyah Rinjani (3323600035)
2. Evinda Eka Ayudia Lestari (3323600039)
3. R. Aj Maria Shovia Fadinda (3323600059)

Dosen Pembimbing:
Yesta Medya Mahardhika, S.Tr.Kom., M.T.
