from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from app.database import Base

class Pemasukan(Base):
    __tablename__ = "pemasukan"

    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey("users.id_user"), default=1)
    sumber = Column(String, nullable=False)
    jumlah = Column(Float, nullable=False)
    tanggal = Column(Date, nullable=False)