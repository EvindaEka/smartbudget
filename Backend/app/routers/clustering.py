from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.auth import get_current_user
from app.models.user import User
from app.database import get_db
from app.utils.clustering import predict_latest_cluster

router = APIRouter(prefix="/clustering", tags=["Clustering"])

@router.get("/prediksi")
def get_cluster_result(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return predict_latest_cluster(current_user.id_user, db)