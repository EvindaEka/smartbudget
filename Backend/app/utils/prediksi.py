import os
import pickle
from enum import Enum
import traceback

# Folder tempat semua model .pkl disimpan
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


class KategoriPengeluaran(str, Enum):
    Kebutuhan_Akademik = "Kebutuhan Akademik"
    Kesehatan = "Kesehatan"
    Makanan_dan_Minuman = "Makanan dan Minuman"
    Transportasi = "Transportasi"
    Lainnya = "Lainnya"

def load_model_by_category(category: str):
    """
    Memuat model pickle (.pkl) berdasarkan kategori (snake_case).
    """
    # Mapping nama kategori ke nama file model
    category_map = {
    "Kebutuhan Akademik": "kebutuhan_akademik.pkl",
    "Kesehatan": "kesehatan.pkl",
    "Makanan dan Minuman": "makanan_dan_minuman.pkl",
    "Transportasi": "transportasi.pkl",
    "Lainnya": "lainnya.pkl"
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
    """
    Melakukan prediksi untuk bulan berikutnya berdasarkan kategori pengeluaran.
    """
    try:
        print(f"[DEBUG] Memuat model untuk kategori: {category}")
        model = load_model_by_category(category)

        if not hasattr(model, "forecast"):
            raise AttributeError("Model tidak memiliki metode 'forecast'. Pastikan model ARIMA telah di-fit sebelum disimpan.")

        forecast = model.forecast(steps=1)

        print(f"[DEBUG] Hasil prediksi: {forecast}")
        return round(float(forecast[0]), 2)

    except Exception as e:
        print("[ERROR] Gagal memuat model atau melakukan prediksi:")
        traceback.print_exc()
        raise RuntimeError(f"Gagal melakukan prediksi: {str(e)}")
