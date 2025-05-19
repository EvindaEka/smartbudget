from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.pemasukan import Pemasukan
from app.schemas.pemasukan import PemasukanCreate, PemasukanOut
from sqlalchemy import func
from typing import List
from app.models.user import User

router = APIRouter(prefix="/pemasukan", tags=["pemasukan"])

# Dependency untuk mendapatkan session database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PemasukanOut)
def create_pemasukan(data: PemasukanCreate, db: Session = Depends(get_db)):

    id_user = data.id_user if data.id_user is not None else 1

    user = db.query(User).filter(User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    pemasukan = Pemasukan(
        id_user=id_user,
        sumber=data.sumber,
        jumlah=data.jumlah,
        tanggal=data.tanggal
    )
    db.add(pemasukan)
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
