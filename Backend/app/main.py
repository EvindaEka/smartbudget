from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, pemasukan, user, pengeluaran
from app.models import pemasukan as pemasukan_model

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartBudget API",
    version="1.0.0",
    description="API untuk pencatatan dan prediksi keuangan mahasiswa"
)

app.include_router(auth.router)
app.include_router(pemasukan.router)
app.include_router(pengeluaran.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the SmartBudget!!"}