from pydantic import BaseModel
from datetime import date

class PemasukanBase(BaseModel):
    sumber: str
    jumlah: float
    tanggal: date

class PemasukanCreate(PemasukanBase):
    pass

class PemasukanOut(PemasukanBase):
    id_pemasukan: int
    id_user: int

    class Config:
        from_attributes = True