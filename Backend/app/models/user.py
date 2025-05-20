from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id_user = Column(Integer, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    jurusan = Column(String)
    universitas = Column(String)
    saldo = Column(Float, default=0.0)

    pemasukan = relationship("Pemasukan", back_populates="user", cascade="all, delete-orphan")
    # pengeluaran = relationship("Pengeluaran", back_populates="user", cascade="all, delete-orphan")