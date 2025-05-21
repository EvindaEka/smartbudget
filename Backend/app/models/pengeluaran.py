from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Pengeluaran(Base):
    __tablename__ = "pengeluaran"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    kategori = Column(String, nullable=False)
    jumlah = Column(Float, nullable=False)
    tanggal = Column(Date, nullable=False)

    user = relationship("User", back_populates="pengeluaran")
