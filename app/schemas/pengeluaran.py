from pydantic import BaseModel
from datetime import date

class PengeluaranBase(BaseModel):
    kategori: str
    jumlah: float
    tanggal: date

class PengeluaranCreate(PengeluaranBase):
    pass

class PengeluaranOut(PengeluaranBase):
    id_pengeluaran: int
    id_user: int

    class Config:
        from_attributes = True
