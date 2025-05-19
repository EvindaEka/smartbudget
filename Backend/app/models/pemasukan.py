from sqlalchemy import Column, Integer, String, Date, Float
from app.database import Base

class Pemasukan(Base):
    __tablename__ = "pemasukan"

    id = Column(Integer, primary_key=True, index=True)
    sumber = Column(String, nullable=False)
    jumlah = Column(Float, nullable=False)
    tanggal = Column(Date, nullable=False)
    user_id = Column(Integer, nullable=False)