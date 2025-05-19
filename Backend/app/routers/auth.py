from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar, silakan login")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        nama=user.nama,
        email=user.email,
        hashed_password=hashed_password,
        jurusan=user.jurusan,
        universitas=user.universitas,
        saldo=0  # default saldo awal
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Registrasi berhasil"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User belum terdaftar, silakan register")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password salah")

    return {"message": "Login berhasil"}
