from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, pemasukan
from app.models import user, pemasukan as pemasukan_model

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartBudget API",
    version="1.0.0",
    description="API untuk pencatatan dan prediksi keuangan mahasiswa"
)

app.include_router(auth.router)
app.include_router(pemasukan.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the SmartBudget!!"}