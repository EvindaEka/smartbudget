from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.utils.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserOut
from app.database import get_db  # asumsi dependency untuk db session
from app.models.pemasukan import Pemasukan  # model pemasukan
from app.models.pengeluaran import Pengeluaran  # model pengeluaran

router = APIRouter(
    prefix="/user",
    tags=["user"]
)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/saldo")
def get_saldo(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id_user

    total_pemasukan = db.query(func.coalesce(func.sum(Pemasukan.jumlah), 0))\
                        .filter(Pemasukan.id_user == user_id).scalar()
    total_pengeluaran = db.query(func.coalesce(func.sum(Pengeluaran.jumlah), 0))\
                         .filter(Pengeluaran.id_user == user_id).scalar()

    saldo = total_pemasukan - total_pengeluaran

    return {"id_user": user_id, "saldo": saldo}