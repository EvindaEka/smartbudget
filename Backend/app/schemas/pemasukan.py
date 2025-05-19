from pydantic import BaseModel
from datetime import date
from typing import Optional

class PemasukanBase(BaseModel):
    sumber: str
    jumlah: float
    tanggal: date

class PemasukanCreate(PemasukanBase):
    id_user: Optional[int] = None

class PemasukanOut(PemasukanBase):
    id: int
    id_user: int

    class Config:
        from_attributes = True