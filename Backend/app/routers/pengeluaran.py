from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import date

from app.models.pengeluaran import Pengeluaran
from app.schemas.pengeluaran import PengeluaranCreate, PengeluaranOut
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.deps import get_db

router = APIRouter(prefix="/pengeluaran", tags=["pengeluaran"])


@router.post("/", response_model=PengeluaranOut)
def create_pengeluaran(
    data: PengeluaranCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.jumlah <= 0:
        raise HTTPException(status_code=400, detail="Jumlah pengeluaran harus lebih besar dari 0")

    pengeluaran = Pengeluaran(
        id_user=current_user.id_user,
        kategori=data.kategori,
        jumlah=data.jumlah,
        tanggal=data.tanggal
    )
    db.add(pengeluaran)

    # Update saldo pengguna
    current_user.saldo -= data.jumlah
    db.commit()
    db.refresh(pengeluaran)

    return pengeluaran


@router.get("/total")
def get_total_pengeluaran(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(func.sum(Pengeluaran.jumlah))\
        .filter(Pengeluaran.id_user == current_user.id_user).scalar() or 0
    return {"id_user": current_user.id_user, "total_pengeluaran": total}


@router.get("/list", response_model=List[PengeluaranOut])
def list_pengeluaran(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = db.query(Pengeluaran)\
        .filter(Pengeluaran.id_user == current_user.id_user)\
        .order_by(Pengeluaran.tanggal.desc()).all()
    return data


@router.get("/total-bulan-ini")
def get_total_pengeluaran_bulan_ini(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    bulan_ini = today.month
    tahun_ini = today.year

    total = (
        db.query(func.sum(Pengeluaran.jumlah))
        .filter(Pengeluaran.id_user == current_user.id_user)
        .filter(extract("month", Pengeluaran.tanggal) == bulan_ini)
        .filter(extract("year", Pengeluaran.tanggal) == tahun_ini)
        .scalar() or 0
    )
    return {
        "id_user": current_user.id_user,
        "bulan": bulan_ini,
        "tahun": tahun_ini,
        "total_pengeluaran_bulan_ini": total
    }

@router.get("/terbaru-periode", response_model=List[PengeluaranOut])
def get_pengeluaran_terbaru_periode(
    tipe: str = Query(..., enum=["harian", "bulanan", "tahunan"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_query = db.query(Pengeluaran).filter(Pengeluaran.id_user == current_user.id_user)

    if tipe == "harian":
        tanggal_terbaru = (
            base_query.order_by(Pengeluaran.tanggal.desc())
            .with_entities(Pengeluaran.tanggal)
            .first()
        )
        if not tanggal_terbaru:
            raise HTTPException(status_code=404, detail="Tidak ada pengeluaran ditemukan")

        results = base_query.filter(Pengeluaran.tanggal == tanggal_terbaru[0]) \
                            .order_by(Pengeluaran.id.desc()).all()

    elif tipe == "bulanan":
        latest = (
            base_query
            .with_entities(func.extract("year", Pengeluaran.tanggal).label("tahun"),
                           func.extract("month", Pengeluaran.tanggal).label("bulan"))
            .order_by(func.extract("year", Pengeluaran.tanggal).desc(),
                      func.extract("month", Pengeluaran.tanggal).desc())
            .first()
        )
        if not latest:
            raise HTTPException(status_code=404, detail="Tidak ada pengeluaran ditemukan")

        tahun_terbaru, bulan_terbaru = int(latest.tahun), int(latest.bulan)

        results = base_query.filter(
            extract("month", Pengeluaran.tanggal) == bulan_terbaru,
            extract("year", Pengeluaran.tanggal) == tahun_terbaru
        ).order_by(Pengeluaran.tanggal.desc(), Pengeluaran.id.desc()).all()

    elif tipe == "tahunan":
        tahun_terbaru = (
            base_query
            .with_entities(extract("year", Pengeluaran.tanggal).label("tahun"))
            .order_by(extract("year", Pengeluaran.tanggal).desc())
            .first()
        )
        if not tahun_terbaru:
            raise HTTPException(status_code=404, detail="Tidak ada pengeluaran ditemukan")

        tahun_terbaru = int(tahun_terbaru.tahun)

        results = base_query.filter(
            extract("year", Pengeluaran.tanggal) == tahun_terbaru
        ).order_by(Pengeluaran.tanggal.desc(), Pengeluaran.id.desc()).all()

    else:
        raise HTTPException(status_code=400, detail="Tipe tidak valid")

    return results
