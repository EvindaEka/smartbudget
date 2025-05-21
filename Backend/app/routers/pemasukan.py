from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime

from app.models.pemasukan import Pemasukan
from app.schemas.pemasukan import PemasukanCreate, PemasukanOut
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.deps import get_db

router = APIRouter(prefix="/pemasukan", tags=["pemasukan"])


@router.post("/", response_model=PemasukanOut)
def create_pemasukan(
    data: PemasukanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.jumlah <= 0:
        raise HTTPException(status_code=400, detail="Jumlah pemasukan harus lebih besar dari 0")

    pemasukan = Pemasukan(
        id_user=current_user.id_user,
        sumber=data.sumber,
        jumlah=data.jumlah,
        tanggal=data.tanggal
    )
    db.add(pemasukan)

    # Update saldo pengguna
    current_user.saldo += data.jumlah
    db.commit()
    db.refresh(pemasukan)

    return pemasukan


@router.get("/total", summary="Total semua pemasukan saat ini")
def get_total_pemasukan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(func.sum(Pemasukan.jumlah))\
        .filter(Pemasukan.id_user == current_user.id_user).scalar() or 0
    return {"id_user": current_user.id_user, "total_pemasukan": total}


@router.get("/list", response_model=List[PemasukanOut], summary="List semua pemasukan")
def list_pemasukan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = db.query(Pemasukan)\
        .filter(Pemasukan.id_user == current_user.id_user)\
        .order_by(Pemasukan.tanggal.desc()).all()
    return data


@router.get("/total-bulanan", summary="Total pemasukan bulan ini")
def get_total_pemasukan_bulanan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    bulan_ini = now.month
    tahun_ini = now.year

    total_bulanan = db.query(func.sum(Pemasukan.jumlah))\
        .filter(
            Pemasukan.id_user == current_user.id_user,
            extract("month", Pemasukan.tanggal) == bulan_ini,
            extract("year", Pemasukan.tanggal) == tahun_ini
        )\
        .scalar() or 0

    return {
        "id_user": current_user.id_user,
        "bulan": bulan_ini,
        "tahun": tahun_ini,
        "total_pemasukan_bulan_ini": total_bulanan
    }


@router.get("/terbaru-periode", response_model=List[PemasukanOut], summary="Daftar pemasukan terbaru berdasarkan periode")
def get_pemasukan_terbaru_periode(
    tipe: str = Query(..., enum=["harian", "bulanan", "tahunan"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_query = db.query(Pemasukan).filter(Pemasukan.id_user == current_user.id_user)

    if tipe == "harian":
        tanggal_terbaru = (
            base_query.order_by(Pemasukan.tanggal.desc())
            .with_entities(Pemasukan.tanggal)
            .first()
        )
        if not tanggal_terbaru:
            raise HTTPException(status_code=404, detail="Tidak ada pemasukan ditemukan")

        results = base_query.filter(Pemasukan.tanggal == tanggal_terbaru[0]) \
                            .order_by(Pemasukan.id.desc()).all()

    elif tipe == "bulanan":
        latest = (
            base_query
            .with_entities(
                func.extract("year", Pemasukan.tanggal).label("tahun"),
                func.extract("month", Pemasukan.tanggal).label("bulan")
            )
            .order_by(
                func.extract("year", Pemasukan.tanggal).desc(),
                func.extract("month", Pemasukan.tanggal).desc()
            )
            .first()
        )
        if not latest:
            raise HTTPException(status_code=404, detail="Tidak ada pemasukan ditemukan")

        tahun_terbaru, bulan_terbaru = int(latest.tahun), int(latest.bulan)

        results = base_query.filter(
            extract("year", Pemasukan.tanggal) == tahun_terbaru,
            extract("month", Pemasukan.tanggal) == bulan_terbaru
        ).order_by(Pemasukan.tanggal.desc(), Pemasukan.id.desc()).all()

    elif tipe == "tahunan":
        tahun_terbaru = (
            base_query
            .with_entities(extract("year", Pemasukan.tanggal).label("tahun"))
            .order_by(extract("year", Pemasukan.tanggal).desc())
            .first()
        )
        if not tahun_terbaru:
            raise HTTPException(status_code=404, detail="Tidak ada pemasukan ditemukan")

        tahun_terbaru = int(tahun_terbaru.tahun)

        results = base_query.filter(
            extract("year", Pemasukan.tanggal) == tahun_terbaru
        ).order_by(Pemasukan.tanggal.desc(), Pemasukan.id.desc()).all()

    else:
        raise HTTPException(status_code=400, detail="Tipe tidak valid")

    return results