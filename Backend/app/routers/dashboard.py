from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.utils.auth import get_current_user
from app.models.user import User
from app.database import get_db
from app.models.pemasukan import Pemasukan
from app.models.pengeluaran import Pengeluaran
from app.utils.prediksi import KategoriPengeluaran, predict_next_month

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

# Jumlah minimal data untuk prediksi
MINIMAL_DATA = 1


@router.get("/pengeluaran-per-kategori")
def pengeluaran_per_kategori(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id_user
    result = db.query(
        Pengeluaran.kategori,
        func.sum(Pengeluaran.jumlah).label("total")
    ).filter(
        Pengeluaran.id_user == user_id
    ).group_by(Pengeluaran.kategori).all()

    return [{"kategori": r.kategori, "total": r.total} for r in result]


@router.get("/pemasukan-per-sumber")
def pemasukan_per_sumber(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id_user
    result = db.query(
        Pemasukan.sumber,
        func.sum(Pemasukan.jumlah).label("total")
    ).filter(
        Pemasukan.id_user == user_id
    ).group_by(Pemasukan.sumber).all()

    return [{"sumber": r.sumber, "total": r.total} for r in result]


@router.get("/prediksi-pengeluaran")
def prediksi_pengeluaran(
    kategori: KategoriPengeluaran,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id_user
    kategori_str = kategori.value  # Sudah dalam format Title Case

    pengeluaran_count = db.query(Pengeluaran).filter(
        Pengeluaran.id_user == user_id,
        Pengeluaran.kategori == kategori_str
    ).count()

    if pengeluaran_count < MINIMAL_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Data pengeluaran untuk kategori '{kategori_str}' masih terlalu sedikit untuk melakukan prediksi (minimal {MINIMAL_DATA} data)"
        )

    try:
        hasil_prediksi = predict_next_month(kategori.value)
        return {
            "kategori": kategori_str,
            "prediksi_bulan_berikutnya": hasil_prediksi
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat prediksi: {str(e)}")
