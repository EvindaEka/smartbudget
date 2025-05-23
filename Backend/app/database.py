from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Ganti dengan koneksi sesuai kredensialmu
DATABASE_URL = "postgresql://postgres:evinda123@localhost:5432/smartbudget_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()