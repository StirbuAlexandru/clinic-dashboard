from datetime import date, datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


from .database import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    date_of_birth: Mapped[date]
    phone: Mapped[str | None] = mapped_column(String(20))
    # Both empty (None) for self-pay patients without insurance
    insurance_provider: Mapped[str | None] = mapped_column(String(100))
    insurance_member_id: Mapped[str | None] = mapped_column(String(50))
    # Photo of the insurance card uploaded by the patient, checked by the staff
    insurance_card_filename: Mapped[str | None] = mapped_column(String(255))
    insurance_review: Mapped[str | None] = mapped_column(String(20))  # pending / approved / rejected


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    specialty: Mapped[str] = mapped_column(String(100))


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    start_time: Mapped[datetime]
    reason: Mapped[str | None] = mapped_column(String(255))
    price_cents: Mapped[int]
    insurance_status: Mapped[str] = mapped_column(String(20), default="unknown")
    billing_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    # Only for self-pay visits booked online: "card" or "at_clinic"
    payment_method: Mapped[str | None] = mapped_column(String(20))
    payment_reference: Mapped[str | None] = mapped_column(String(50))
    patient: Mapped["Patient"] = relationship()
    doctor: Mapped["Doctor"] = relationship()
