from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, pemasukan, user, pengeluaran

# Inisialisasi semua tabel dari model
Base.metadata.create_all(bind=engine)

# Inisialisasi FastAPI
app = FastAPI(
    title="SmartBudget API",
    version="1.0.0",
    description="API untuk pencatatan dan prediksi keuangan mahasiswa"
)

# Konfigurasi CORS agar bisa diakses dari frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routing ke semua modul
app.include_router(auth.router)
app.include_router(pemasukan.router)
app.include_router(pengeluaran.router)
app.include_router(user.router)
app.include_router(dashboard.router)

# Endpoint default
@app.get("/")
def read_root():
    return {"message": "Welcome to the SmartBudget!!"}
