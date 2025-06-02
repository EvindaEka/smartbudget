from pydantic import BaseModel, EmailStr, field_validator
import re

class UserCreate(BaseModel):
    nama: str
    email: EmailStr
    password: str
    jurusan: str
    universitas: str

    @field_validator("password")
    def password_must_have_letters_and_numbers(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search("[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search("[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

class UserOut(BaseModel):
    id_user: int
    nama: str
    email: EmailStr
    jurusan: str
    universitas: str
    saldo: float

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str