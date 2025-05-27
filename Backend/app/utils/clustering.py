import os
import pickle
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.pengeluaran import Pengeluaran
from app.models.pemasukan import Pemasukan  # Pastikan model ini sudah ada
from datetime import datetime

# Path ke model dan scaler
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'kmeans_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'scaler.pkl')

# Load model dan scaler
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

with open(SCALER_PATH, 'rb') as f:
    scaler = pickle.load(f)

# Mapping label cluster (bisa dimodifikasi sesuai urutan model)
cluster_labels = {
    0: "Hemat",
    1: "Normal",
    2: "Boros"
}

# Fungsi ekstraksi fitur bulanan dari database
def extract_monthly_features(user_id: int, db: Session) -> pd.DataFrame:
    pengeluaran = db.query(Pengeluaran).filter(Pengeluaran.id_user == user_id).all()
    pemasukan = db.query(Pemasukan).filter(Pemasukan.id_user == user_id).all()

    if not pengeluaran and not pemasukan:
        return pd.DataFrame()

    # DataFrame pengeluaran
    df_pengeluaran = pd.DataFrame([{
        "tanggal": p.tanggal,
        "jumlah": p.jumlah
    } for p in pengeluaran])
    df_pengeluaran["bulan"] = pd.to_datetime(df_pengeluaran["tanggal"]).dt.to_period("M")
    pengeluaran_bulanan = df_pengeluaran.groupby("bulan")["jumlah"].sum().reset_index(name="total_pengeluaran")

    # DataFrame pemasukan
    df_pemasukan = pd.DataFrame([{
        "tanggal": p.tanggal,
        "jumlah": p.jumlah
    } for p in pemasukan])
    df_pemasukan["bulan"] = pd.to_datetime(df_pemasukan["tanggal"]).dt.to_period("M")
    pemasukan_bulanan = df_pemasukan.groupby("bulan")["jumlah"].sum().reset_index(name="total_pemasukan")

    # Gabung kedua data
    gabung = pd.merge(pemasukan_bulanan, pengeluaran_bulanan, on="bulan", how="outer").fillna(0)

    # Fitur tambahan
    gabung["tabungan"] = gabung["total_pemasukan"] - gabung["total_pengeluaran"]
    gabung["rasio_pengeluaran"] = gabung["total_pengeluaran"] / gabung["total_pemasukan"]
    gabung["rasio_pengeluaran"] = gabung["rasio_pengeluaran"].replace([np.inf, -np.inf], 0).fillna(0)

    gabung.set_index("bulan", inplace=True)
    return gabung

# Fungsi prediksi cluster terbaru user
def predict_latest_cluster(user_id: int, db: Session) -> dict:
    features = extract_monthly_features(user_id, db)

    if features.empty:
        return {"message": "Data belum cukup untuk prediksi cluster."}

    latest = features.iloc[-1:]  # Data bulan terakhir
    scaled = scaler.transform(latest)
    cluster = model.predict(scaled)[0]
    label = cluster_labels.get(cluster, "Tidak diketahui")

    return {
        "cluster": int(cluster),
        "label": label,
        "data_bulan": str(latest.index[0])
    }
