"""Opening hours and time-slot rules for booking appointments."""

from datetime import date, datetime, time, timedelta

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models

OPENING_HOUR = 9
CLOSING_HOUR = 17
SLOT_MINUTES = 60
SLOT_LENGTH = timedelta(minutes=SLOT_MINUTES)


def day_slots(day: date) -> list[datetime]:
    """All start times the clinic offers on one day: 09:00, 10:00, ... 16:00."""
    first_slot = datetime.combine(day, time(OPENING_HOUR))
    slot_count = (CLOSING_HOUR - OPENING_HOUR) * 60 // SLOT_MINUTES
    return [first_slot + SLOT_LENGTH * i for i in range(slot_count)]


def booked_times(db: Session, doctor_id: int, day: date) -> list[datetime]:
    """Start times of the doctor's appointments on that day."""
    day_start = datetime.combine(day, time.min)
    day_end = day_start + timedelta(days=1)
    query = select(models.Appointment.start_time).where(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.start_time >= day_start,
        models.Appointment.start_time < day_end,
    )
    return list(db.scalars(query).all())


def overlaps(start_time: datetime, booked: list[datetime]) -> bool:
    """Two appointments overlap if they start less than one slot apart."""
    return any(abs(start_time - other) < SLOT_LENGTH for other in booked)


def available_slots(db: Session, doctor_id: int, day: date) -> list[datetime]:
    """Free slots for a doctor on a day, without the ones already in the past."""
    booked = booked_times(db, doctor_id, day)
    now = datetime.now()
    return [
        slot for slot in day_slots(day) if slot > now and not overlaps(slot, booked)
    ]


def ensure_slot_is_free(db: Session, doctor_id: int, start_time: datetime) -> None:
    """Stop the request with 409 Conflict if the doctor is already booked."""
    booked = booked_times(db, doctor_id, start_time.date())
    if overlaps(start_time, booked):
        raise HTTPException(
            status_code=409, detail="The doctor already has an appointment at this time"
        )
