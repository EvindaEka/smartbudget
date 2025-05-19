from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth
from app.models.pemasukan import Pemasukan  # import semua modelmu

Base.metadata.create_all(bind=engine)

app = FastAPI()


app.include_router(auth.router)

# Tambahkan endpoint dasar agar bisa dicek
@app.get("/")
def read_root():
    return {"message": "SmartBudget API is running!"}