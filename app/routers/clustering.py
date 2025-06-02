from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.utils.auth import get_current_user
from app.models.user import User
from app.database import get_db
from app.utils.clustering import predict_cluster_for_month
from datetime import datetime

router = APIRouter(prefix="/clustering", tags=["Clustering"])

@router.get("/prediksi")
def get_cluster_prediction(
    bulan: int = Query(default=datetime.now().month, ge=1, le=12),
    tahun: int = Query(default=datetime.now().year),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint untuk memprediksi tipe pengeluaran user berdasarkan data bulan & tahun tertentu.
    """
    hasil_prediksi = predict_cluster_for_month(
        user_id=current_user.id_user,
        year=tahun,
        month=bulan,
        db=db
    )
    
    if 'message' in hasil_prediksi:
        # Jika data tidak cukup, lempar HTTPException 404 atau 204 sesuai preferensi
        raise HTTPException(status_code=404, detail=hasil_prediksi['message'])
    
    return hasil_prediksi
