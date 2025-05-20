from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.pemasukan import Pemasukan
from app.schemas.pemasukan import PemasukanCreate, PemasukanOut
from sqlalchemy import func
from typing import List
from app.models.user import User

router = APIRouter(prefix="/pemasukan", tags=["pemasukan"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PemasukanOut)
def create_pemasukan(data: PemasukanCreate, db: Session = Depends(get_db)):

    if data.id_user is None:
        raise HTTPException(status_code=400, detail="id_user tidak boleh kosong")

    user = db.query(User).filter(User.id_user == data.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if data.jumlah <= 0:
        raise HTTPException(status_code=400, detail="Jumlah pemasukan harus lebih besar dari 0")

    pemasukan = Pemasukan(
        id_user=data.id_user,
        sumber=data.sumber,
        jumlah=data.jumlah,
        tanggal=data.tanggal
    )
    db.add(pemasukan)

    # Update saldo pengguna
    user.saldo += data.jumlah
    db.commit()
    db.refresh(pemasukan)
    
    return pemasukan


@router.get("/total/{id_user}")
def get_total_pemasukan(id_user: int, db: Session = Depends(get_db)):
    total = db.query(func.sum(Pemasukan.jumlah)).filter(Pemasukan.id_user == id_user).scalar() or 0
    return {"id_user": id_user, "total_pemasukan": total}

@router.get("/list/{id_user}", response_model=List[PemasukanOut])
def list_pemasukan(id_user: int, db: Session = Depends(get_db)):
    data = db.query(Pemasukan).filter(Pemasukan.id_user == id_user).order_by(Pemasukan.tanggal.desc()).all()
    return data
