import os
import pickle
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models.pengeluaran import Pengeluaran
from app.models.pemasukan import Pemasukan

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'kmeans_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, '..', 'models', 'scaler.pkl')

def load_model_and_scaler():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise FileNotFoundError("Model atau Scaler tidak ditemukan.")
    
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    return model, scaler

def extract_features_for_month(user_id: int, year: int, month: int, db: Session) -> pd.DataFrame:
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    total_pemasukan = db.query(func.sum(Pemasukan.jumlah)).filter(
        Pemasukan.id_user == user_id,
        Pemasukan.tanggal >= start_date,
        Pemasukan.tanggal < end_date
    ).scalar() or 0

    total_pengeluaran = db.query(func.sum(Pengeluaran.jumlah)).filter(
        Pengeluaran.id_user == user_id,
        Pengeluaran.tanggal >= start_date,
        Pengeluaran.tanggal < end_date
    ).scalar() or 0

    if total_pemasukan == 0:
        rasio_pengeluaran = 0
    else:
        rasio_pengeluaran = total_pengeluaran / total_pemasukan

    tabungan = total_pemasukan - total_pengeluaran

    fitur = pd.DataFrame([{
        "total_pemasukan": total_pemasukan,
        "total_pengeluaran": total_pengeluaran,
        "tabungan": tabungan,
        "rasio_pengeluaran": rasio_pengeluaran
    }])

    return fitur

def predict_cluster_for_month(user_id: int, year: int, month: int, db: Session) -> dict:
    features = extract_features_for_month(user_id, year, month, db)

    # Cek data cukup dan valid (harus ada pemasukan dan pengeluaran > 0)
    if features.empty or features['total_pemasukan'][0] == 0:
        return {"message": "Data tidak cukup untuk bulan tersebut."}

    model, scaler = load_model_and_scaler()
    scaled = scaler.transform(features)
    cluster = model.predict(scaled)[0]

    # Ambil indeks rasio_pengeluaran dari fitur
    rasio_idx = list(features.columns).index('rasio_pengeluaran')

    # Dapatkan centroid cluster dan ambil nilai rasio_pengeluaran
    cluster_centers = model.cluster_centers_
    cluster_rasio = [(i, center[rasio_idx]) for i, center in enumerate(cluster_centers)]

    # Urutkan cluster berdasarkan nilai rasio pengeluaran (rendah ke tinggi)
    cluster_sorted = sorted(cluster_rasio, key=lambda x: x[1])

    # Mapping label cluster berdasarkan urutan rasio_pengeluaran
    label_mapping = {
        cluster_sorted[0][0]: "Hemat",
        cluster_sorted[1][0]: "Normal",
        cluster_sorted[2][0]: "Boros"
    }

    label = label_mapping.get(cluster, "Tidak diketahui")

    return {
        "cluster": int(cluster),
        "label": label,
        "total_pemasukan": float(features['total_pemasukan'][0]),
        "total_pengeluaran": float(features['total_pengeluaran'][0]),
        "tabungan": float(features['tabungan'][0]),
        "rasio_pengeluaran": float(features['rasio_pengeluaran'][0]),
        "bulan": f"{month:02d}/{year}"
    }
