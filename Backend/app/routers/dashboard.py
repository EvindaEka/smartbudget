from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.utils.auth import get_current_user
from app.models.user import User
from app.database import get_db
from app.models.pemasukan import Pemasukan
from app.models.pengeluaran import Pengeluaran
from app.utils.prediksi import retrain_model_from_db, retrain_semua_kategori
from app.utils.prediksi import (
    KategoriPengeluaran,
    predict_next_month,
    predict_with_history
)

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

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

@router.get("/total-pemasukan")
def total_pemasukan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(func.sum(Pemasukan.jumlah))\
        .filter(Pemasukan.id_user == current_user.id_user).scalar() or 0
    return {"id_user": current_user.id_user, "total": total}

@router.get("/prediksi-pengeluaran")
def prediksi_pengeluaran(
    kategori: KategoriPengeluaran,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id_user
    kategori_str = kategori.value

    pengeluaran_count = db.query(Pengeluaran).filter(
        Pengeluaran.id_user == user_id,
        Pengeluaran.kategori == kategori_str
    ).count()

    if pengeluaran_count < MINIMAL_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Data pengeluaran untuk kategori '{kategori_str}' masih terlalu sedikit (minimal {MINIMAL_DATA})"
        )

    try:
        hasil_prediksi = predict_next_month(kategori.value, user_id)
        return {
            "kategori": kategori_str,
            "prediksi_bulan_berikutnya": hasil_prediksi
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat prediksi: {str(e)}")

@router.get("/prediksi-pengeluaran-history")
def prediksi_pengeluaran_history(
    kategori: KategoriPengeluaran,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = current_user.id_user
        hasil = predict_with_history(kategori.value, user_id=user_id, db=db)
        return {
            "kategori": kategori.value,
            **hasil
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prediksi-pengeluaran-total")
def prediksi_pengeluaran_total(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        hasil = predict_with_history("Semua", user_id=current_user.id_user, db=db)
        return {
            "kategori": "Total",
            **hasil
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal prediksi total: {str(e)}")

@router.get("/total")
def get_total_pengeluaran(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(func.sum(Pengeluaran.jumlah))\
        .filter(Pengeluaran.id_user == current_user.id_user).scalar() or 0
    return {"id_user": current_user.id_user, "total": total}

@router.post("/retrain")
def retrain_model_endpoint(
    kategori: KategoriPengeluaran,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        pesan = retrain_model_from_db(kategori.value, db, current_user.id_user)
        return {"status": "success", "message": pesan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal retrain model: {str(e)}")

@router.post("/retrain-semua")
def retrain_semua_model_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        hasil = retrain_semua_kategori(db, current_user.id_user)
        return {"status": "selesai", "hasil": hasil}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal retrain semua model: {str(e)}")
