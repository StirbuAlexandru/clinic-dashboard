from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..billing import can_change_status
from ..database import get_db
from ..insurance import check_eligibility
from ..scheduling import ensure_slot_is_free

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("", response_model=schemas.AppointmentRead, status_code=201)
def create_appointment(
    appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)
):
    patient = db.get(models.Patient, appointment.patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    if db.get(models.Doctor, appointment.doctor_id) is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    ensure_slot_is_free(db, appointment.doctor_id, appointment.start_time)

    db_appointment = models.Appointment(**appointment.model_dump())
    db_appointment.insurance_status = check_eligibility(
        patient.insurance_provider, patient.insurance_member_id
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@router.get("", response_model=list[schemas.AppointmentRead])
def list_appointments(
    billing_status: Literal["unpaid", "submitted", "paid", "denied"] | None = None,
    doctor_id: int | None = None,
    start_from: datetime | None = None,
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(models.Appointment).order_by(models.Appointment.start_time)
    if billing_status is not None:
        query = query.where(models.Appointment.billing_status == billing_status)
    if doctor_id is not None:
        query = query.where(models.Appointment.doctor_id == doctor_id)
    if start_from is not None:
        query = query.where(models.Appointment.start_time >= start_from)
    if limit is not None:
        query = query.limit(limit)
    return db.scalars(query).all()


@router.get("/{appointment_id}", response_model=schemas.AppointmentRead)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.get(models.Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.patch("/{appointment_id}/billing", response_model=schemas.AppointmentRead)
def update_billing_status(
    appointment_id: int,
    update: schemas.BillingStatusUpdate,
    db: Session = Depends(get_db),
):
    appointment = db.get(models.Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # An insurance claim describes a visit that already happened
    if update.status == "submitted" and appointment.start_time > datetime.now():
        raise HTTPException(
            status_code=400, detail="A claim can only be submitted after the visit took place"
        )

    self_pay = appointment.insurance_status == "self_pay"
    if not can_change_status(appointment.billing_status, update.status, self_pay):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change billing status from {appointment.billing_status} to {update.status}",
        )

    appointment.billing_status = update.status
    db.commit()
    db.refresh(appointment)
    return appointment
