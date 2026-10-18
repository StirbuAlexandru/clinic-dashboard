"""Public booking endpoint used by the patient portal."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..billing import visit_price_cents
from ..database import get_db
from ..insurance import check_eligibility
from ..payments import charge
from ..scheduling import day_slots, ensure_slot_is_free

router = APIRouter(prefix="/bookings", tags=["patient portal"])


def find_or_create_patient(db: Session, booking: schemas.BookingCreate) -> models.Patient:
    """Recognise a returning patient, so we don't create the same person twice.

    Insured patients are matched by member ID + last name,
    self-pay patients by full name + date of birth.
    """
    query = select(models.Patient).where(models.Patient.last_name == booking.last_name)
    if booking.insurance_member_id is not None:
        query = query.where(models.Patient.insurance_member_id == booking.insurance_member_id)
    else:
        query = query.where(
            models.Patient.first_name == booking.first_name,
            models.Patient.date_of_birth == booking.date_of_birth,
            models.Patient.insurance_member_id.is_(None),
        )
    patient = db.scalars(query).first()
    if patient is None:
        patient = models.Patient(
            first_name=booking.first_name,
            last_name=booking.last_name,
            date_of_birth=booking.date_of_birth,
            phone=booking.phone,
            insurance_provider=booking.insurance_provider,
            insurance_member_id=booking.insurance_member_id,
        )
        db.add(patient)
    return patient


@router.post("", response_model=schemas.BookingConfirmation, status_code=201)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    doctor = db.get(models.Doctor, booking.doctor_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Online bookings must use one of the clinic's slots
    if booking.start_time not in day_slots(booking.start_time.date()):
        raise HTTPException(status_code=400, detail="Please choose one of the available time slots")
    ensure_slot_is_free(db, doctor.id, booking.start_time)

    patient = find_or_create_patient(db, booking)
    appointment = models.Appointment(
        patient=patient,
        doctor=doctor,
        start_time=booking.start_time,
        reason=booking.reason,
        price_cents=visit_price_cents(doctor.specialty),
        insurance_status=check_eligibility(
            patient.insurance_provider, patient.insurance_member_id
        ),
    )

    # Self-pay patients pay by card now or at the clinic later
    if appointment.insurance_status == "self_pay":
        appointment.payment_method = booking.payment_method or "at_clinic"
        if appointment.payment_method == "card":
            # If the card is declined, charge() stops the request and nothing
            # is saved, because we haven't committed yet
            appointment.payment_reference = charge(booking.payment_token, appointment.price_cents)
            appointment.billing_status = "paid"

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return schemas.BookingConfirmation(
        appointment_id=appointment.id,
        patient_id=patient.id,
        doctor_name=f"{doctor.first_name} {doctor.last_name}",
        specialty=doctor.specialty,
        start_time=appointment.start_time,
        price_cents=appointment.price_cents,
        insurance_status=appointment.insurance_status,
        billing_status=appointment.billing_status,
        payment_method=appointment.payment_method,
    )
