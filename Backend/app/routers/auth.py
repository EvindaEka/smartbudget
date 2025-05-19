from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserLogin
from app.utils.auth import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar, silakan login")

    hashed_password = hash_password(user.password)
    new_user = User(
        nama=user.nama,
        email=user.email,
        hashed_password=hashed_password,
        jurusan=user.jurusan,
        universitas=user.universitas,
        saldo=0.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User belum terdaftar, silakan register")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password salah")

    return {"message": "Login berhasil"}