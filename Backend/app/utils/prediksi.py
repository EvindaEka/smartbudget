import os
import pickle
import traceback
import pandas as pd
from datetime import datetime
from enum import Enum

# Folder tempat semua model disimpan
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

class KategoriPengeluaran(str, Enum):
    Kebutuhan_Akademik = "Kebutuhan Akademik"
    Kesehatan = "Kesehatan"
    Makanan_dan_Minuman = "Makanan dan Minuman"
    Transportasi = "Transportasi"
    Lainnya = "Lainnya"

def load_model_by_category(category: str):
    category_map = {
        "Kebutuhan Akademik": "kebutuhan_akademik.pkl",
        "Kesehatan": "kesehatan.pkl",
        "Makanan dan Minuman": "makanan_dan_minuman.pkl",
        "Transportasi": "transportasi.pkl",
        "Lainnya": "Lainnya.pkl",
        "Semua": "model_arima.pkl"  # model total
    }

    filename = category_map.get(category)
    if not filename:
        raise ValueError(f"Kategori '{category}' tidak dikenal.")

    model_path = os.path.abspath(os.path.join(MODEL_DIR, filename))

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model tidak ditemukan di: {model_path}")

    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        raise RuntimeError(f"Gagal memuat model dari '{model_path}': {str(e)}")

def predict_next_month(category: str) -> float:
    try:
        print(f"[DEBUG] Memuat model untuk kategori: {category}")
        model = load_model_by_category(category)

        if not hasattr(model, "forecast"):
            raise AttributeError("Model tidak memiliki metode 'forecast'.")

        forecast = model.forecast(steps=1)
        return round(float(forecast[0]), 2)

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Gagal melakukan prediksi: {str(e)}")

def predict_with_history(category: str):
    try:
        print(f"[DEBUG] Memuat model untuk kategori: {category}")
        model = load_model_by_category(category)

        if hasattr(model, "forecast") and hasattr(model, "data"):
            historis = model.data.endog
            start_date = model.data.dates[0] if model.data.dates is not None else None
        elif hasattr(model, "model_") and hasattr(model.model_, "data"):
            historis = model.model_.data.endog
            start_date = model.model_.data.dates[0] if model.model_.data.dates is not None else None
        else:
            raise AttributeError("Model tidak valid atau belum di-fit.")

        if start_date:
            dates = pd.date_range(start=start_date, periods=len(historis), freq='MS')
        else:
            dates = pd.date_range(end=datetime.today(), periods=len(historis), freq='MS')

        df_hist = pd.DataFrame({
            "bulan": dates.strftime("%Y-%m"),
            "pengeluaran": historis
        })

        forecast = model.forecast(steps=1)
        next_month = dates[-1] + pd.DateOffset(months=1)
        df_pred = pd.DataFrame({
            "bulan": [next_month.strftime("%Y-%m")],
            "pengeluaran": [float(forecast[0])]
        })

        return {
            "data_aktual": df_hist.to_dict(orient="records"),
            "prediksi_bulan_berikutnya": df_pred.to_dict(orient="records")[0]
        }

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Gagal mengambil data historis + prediksi: {str(e)}")