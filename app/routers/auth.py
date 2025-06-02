from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserLogin
from app.utils.auth import hash_password, verify_password, create_access_token
from app.utils.deps import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# REGISTER USER
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

# MANUAL LOGIN (frontend)
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User belum terdaftar, silakan daftar")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password salah")

    access_token = create_access_token(data={"sub": str(db_user.id_user)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id_user": db_user.id_user,
            "nama": db_user.nama,
            "email": db_user.email
        }
    }

# LOGIN UNTUK SWAGGER (OAuth2 Password Flow)
@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id_user)})
    return {"access_token": token, "token_type": "bearer"}