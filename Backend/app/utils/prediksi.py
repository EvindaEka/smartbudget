import os
import pickle
import traceback
import pandas as pd
from datetime import datetime
from enum import Enum
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from app.models.pengeluaran import Pengeluaran
from sqlalchemy.orm import Session

# Folder tempat semua model disimpan
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

class KategoriPengeluaran(str, Enum):
    Kebutuhan_Akademik = "Kebutuhan Akademik"
    Kesehatan = "Kesehatan"
    Makanan_dan_Minuman = "Makanan dan Minuman"
    Transportasi = "Transportasi"
    Lainnya = "Lainnya"

def load_model_by_category(category: str, user_id: int = None):
    if user_id is None:
        raise ValueError("user_id diperlukan untuk load model per user")

    category_map = {
        "Kebutuhan Akademik": "kebutuhan_akademik",
        "Kesehatan": "kesehatan",
        "Makanan dan Minuman": "makanan_dan_minuman",
        "Transportasi": "transportasi",
        "Lainnya": "lainnya",
        "Semua": "model_arima"
    }

    base_filename = category_map.get(category)
    if not base_filename:
        raise ValueError(f"Kategori '{category}' tidak dikenal.")

    filename = f"{base_filename}_user_{user_id}.pkl"
    model_path = os.path.abspath(os.path.join(MODEL_DIR, filename))

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model tidak ditemukan di: {model_path}")

    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        raise RuntimeError(f"Gagal memuat model dari '{model_path}': {str(e)}")

def predict_next_month(category: str, user_id:int) -> float:
    try:
        print(f"[DEBUG] Memuat model untuk kategori: {category} dan user_id: {user_id}")
        model = load_model_by_category(category, user_id)  # <-- penting!

        if not hasattr(model, "forecast"):
            raise AttributeError("Model tidak memiliki metode 'forecast'.")

        forecast = model.forecast(steps=1)
        return round(float(forecast[0]), 2)

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Gagal melakukan prediksi: {str(e)}")

def predict_with_history(category: str, user_id: int = None, db: Session = None):
    try:
        print(f"[DEBUG] Memuat model untuk kategori: {category}")

        if user_id is None:
            raise ValueError("user_id diperlukan untuk prediksi.")
        if db is None:
            raise ValueError("db (Session) diperlukan untuk prediksi.")

        if category == "Semua":
            # Ambil seluruh pengeluaran user
            data = db.query(Pengeluaran).filter(Pengeluaran.id_user == user_id).all()

            if not data:
                raise ValueError("Tidak ada data pengeluaran ditemukan untuk user.")

            df = pd.DataFrame([{
                "tanggal": p.tanggal,
                "jumlah": p.jumlah
            } for p in data])

            df['bulan'] = pd.to_datetime(df['tanggal']).dt.to_period('M').dt.to_timestamp()
            df_bulanan = df.groupby('bulan')['jumlah'].sum().sort_index()
            df_bulanan.index = pd.DatetimeIndex(df_bulanan.index)
            df_bulanan = df_bulanan.asfreq('MS').fillna(0)

            if len(df_bulanan) < 3:
                # fallback jika data terlalu sedikit
                return {
                    "data_aktual": [],
                    "prediksi_bulan_berikutnya": {
                        "bulan": (datetime.today() + pd.DateOffset(months=1)).strftime("%Y-%m"),
                        "pengeluaran": 0.0
                    }
                }

            model = ARIMA(df_bulanan, order=(1, 0, 2))
            model_fit = model.fit()

            historis = model_fit.data.endog
            dates = pd.date_range(start=df_bulanan.index[0], periods=len(historis), freq='MS')

            df_hist = pd.DataFrame({
                "bulan": dates.strftime("%Y-%m"),
                "pengeluaran": historis
            })

            forecast = model_fit.forecast(steps=1)
            next_month = dates[-1] + pd.DateOffset(months=1)

            df_pred = pd.DataFrame({
                "bulan": [next_month.strftime("%Y-%m")],
                "pengeluaran": [float(forecast.iloc[0])]
            })

            return {
                "data_aktual": df_hist.to_dict(orient="records"),
                "prediksi_bulan_berikutnya": df_pred.to_dict(orient="records")[0]
            }

        else:
            # Ambil data pengeluaran user per kategori
            data = db.query(Pengeluaran).filter(
                Pengeluaran.id_user == user_id,
                Pengeluaran.kategori == category
            ).all()

            if not data:
                raise ValueError("Tidak ada data pengeluaran ditemukan untuk user dan kategori tersebut.")

            df = pd.DataFrame([{
                "tanggal": p.tanggal,
                "jumlah": p.jumlah
            } for p in data])

            df['bulan'] = pd.to_datetime(df['tanggal']).dt.to_period('M').dt.to_timestamp()
            df_bulanan = df.groupby('bulan')['jumlah'].sum().sort_index()
            df_bulanan.index = pd.DatetimeIndex(df_bulanan.index)
            if df_bulanan.index.freq is None:
                df_bulanan = df_bulanan.asfreq('MS').fillna(0)

            if len(df_bulanan) < 3:
                return {
                    "data_aktual": [],
                    "prediksi_bulan_berikutnya": {
                        "bulan": (datetime.today() + pd.DateOffset(months=1)).strftime("%Y-%m"),
                        "pengeluaran": 0.0
                    }
                }

            # Bisa sesuaikan model per kategori jika mau, contoh:
            if category == "Kebutuhan Akademik":
                model = ARIMA(df_bulanan, order=(2, 1, 2))
            elif category == "Kesehatan":
                model = ExponentialSmoothing(df_bulanan, trend='add', seasonal=None, seasonal_periods=3)
            elif category == "Makanan dan Minuman":
                model = ExponentialSmoothing(df_bulanan, trend='add', seasonal=None, seasonal_periods=3)
            elif category == "Lainnya":
                model = ExponentialSmoothing(df_bulanan, trend=None, seasonal='mul', seasonal_periods=3)
            elif category == "Transportasi":
                model = ARIMA(df_bulanan, order=(0, 0, 2))
            else:
                # default fallback
                model = ARIMA(df_bulanan, order=(1, 0, 1))

            model_fit = model.fit()

            historis = model_fit.data.endog
            dates = pd.date_range(start=df_bulanan.index[0], periods=len(historis), freq='MS')

            df_hist = pd.DataFrame({
                "bulan": dates.strftime("%Y-%m"),
                "pengeluaran": historis
            })

            forecast = model_fit.forecast(steps=1)
            next_month = dates[-1] + pd.DateOffset(months=1)

            df_pred = pd.DataFrame({
                "bulan": [next_month.strftime("%Y-%m")],
                "pengeluaran": [float(forecast.iloc[0])]
            })

            return {
                "data_aktual": df_hist.to_dict(orient="records"),
                "prediksi_bulan_berikutnya": df_pred.to_dict(orient="records")[0]
            }

    except Exception as e:
        traceback.print_exc()
        return {
            "data_aktual": [],
            "prediksi_bulan_berikutnya": {
                "bulan": (datetime.today() + pd.DateOffset(months=1)).strftime("%Y-%m"),
                "pengeluaran": 0.0
            },
            "error": f"Gagal memproses prediksi: {str(e)}"
        }

def retrain_model_from_db(kategori: str, db: Session, user_id: int):
    if kategori == "Semua":
        data = db.query(Pengeluaran).filter(Pengeluaran.id_user == user_id).all()
    else:
        data = db.query(Pengeluaran).filter(
            Pengeluaran.id_user == user_id,
            Pengeluaran.kategori == kategori
        ).all()

    if not data:
        raise ValueError("Tidak ada data pengeluaran untuk retraining.")

    df = pd.DataFrame([{
        "tanggal": p.tanggal,
        "jumlah": p.jumlah
    } for p in data])

    df["jumlah"] = pd.to_numeric(df["jumlah"], errors="coerce").fillna(0)
    df['bulan'] = pd.to_datetime(df['tanggal']).dt.to_period('M').dt.to_timestamp()
    df_bulanan = df.groupby('bulan')['jumlah'].sum().sort_index()
    df_bulanan.index = pd.DatetimeIndex(df_bulanan.index, freq='MS')

    if len(df_bulanan) < 3:
        raise ValueError("Data tidak cukup untuk retraining model.")

    if kategori == "Kebutuhan Akademik":
        model = ARIMA(df_bulanan, order=(2, 1, 2))
        model_fit = model.fit()
    elif kategori == "Kesehatan":
        model = ExponentialSmoothing(df_bulanan, trend='add', seasonal=None, seasonal_periods=3)
        model_fit = model.fit()
    elif kategori == "Makanan dan Minuman":
        model = ExponentialSmoothing(df_bulanan, trend='add', seasonal=None, seasonal_periods=3)
        model_fit = model.fit()
    elif kategori == "Lainnya":
        model = ExponentialSmoothing(df_bulanan, trend=None, seasonal='mul', seasonal_periods=3)
        model_fit = model.fit()
    elif kategori == "Transportasi":
        model = ARIMA(df_bulanan, order=(0, 0, 2))
        model_fit = model.fit()
    elif kategori == "Semua":
        model = ARIMA(df_bulanan, order=(1, 0, 2))
        model_fit = model.fit()
    else:
        raise ValueError("Kategori tidak dikenali")

    # Simpan model per user dan kategori
    os.makedirs(MODEL_DIR, exist_ok=True)
    safe_kategori = kategori.lower().replace(' ', '_')
    filename = f"{safe_kategori}_user_{user_id}.pkl"
    model_path = os.path.join(MODEL_DIR, filename)

    with open(model_path, 'wb') as f:
        pickle.dump(model_fit, f)

    return f"Model untuk kategori '{kategori}' dan user_id '{user_id}' berhasil diretrain dan disimpan ke '{filename}'"

def retrain_semua_kategori(db: Session, user_id: int):
    kategori_list = [
        "Kebutuhan Akademik",
        "Kesehatan",
        "Makanan dan Minuman",
        "Transportasi",
        "Lainnya",
        "Semua"
    ]

    hasil = []
    for kategori in kategori_list:
        try:
            pesan = retrain_model_from_db(kategori, db, user_id)
            hasil.append({"kategori": kategori, "status": "success", "message": pesan})
        except Exception as e:
            hasil.append({"kategori": kategori, "status": "failed", "message": str(e)})
    
    return hasil