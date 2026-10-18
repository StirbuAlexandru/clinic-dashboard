from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..scheduling import available_slots

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.post("", response_model=schemas.DoctorRead, status_code=201)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = models.Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


@router.get("", response_model=list[schemas.DoctorRead])
def list_doctors(db: Session = Depends(get_db)):
    return db.scalars(select(models.Doctor)).all()


@router.get("/{doctor_id}", response_model=schemas.DoctorRead)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.get(models.Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.get("/{doctor_id}/availability", response_model=list[datetime])
def get_availability(doctor_id: int, day: date, db: Session = Depends(get_db)):
    """Free time slots of a doctor on one day, e.g. ?day=2026-10-20"""
    if db.get(models.Doctor, doctor_id) is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return available_slots(db, doctor_id, day)
