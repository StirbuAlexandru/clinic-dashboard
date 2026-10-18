from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

from . import billing


class InsuranceFields(BaseModel):
    """Insurance is optional (self-pay), but provider and member ID go together."""

    insurance_provider: str | None = Field(default=None, min_length=1)
    insurance_member_id: str | None = Field(default=None, min_length=1)

    @model_validator(mode="after")
    def provider_and_member_id_together(self):
        if (self.insurance_provider is None) != (self.insurance_member_id is None):
            raise ValueError("Insurance provider and member ID must be given together")
        return self


class PatientCreate(InsuranceFields):
    first_name: str
    last_name: str
    date_of_birth: date
    phone: str | None = None


class PatientRead(PatientCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    insurance_card_filename: str | None = None
    insurance_review: str | None = None


class InsuranceReviewUpdate(BaseModel):
    decision: Literal["approved", "rejected"]


class DoctorCreate(BaseModel):
    first_name: str
    last_name: str
    specialty: str


class DoctorRead(DoctorCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int

    @computed_field
    @property
    def visit_price_cents(self) -> int:
        """Price of a visit, shown to patients before they book."""
        return billing.visit_price_cents(self.specialty)


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    start_time: datetime
    reason: str | None = None
    price_cents: int


class AppointmentRead(AppointmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    insurance_status: str
    billing_status: str


class BillingStatusUpdate(BaseModel):
    status: Literal["unpaid", "submitted", "denied", "paid"]


class Stats(BaseModel):
    total_appointments: int
    appointments_by_status: dict[str, int]
    paid_cents: int
    pending_cents: int


class MonthlyRevenue(BaseModel):
    month: str
    paid_cents: int
    pending_cents: int


class BookingCreate(InsuranceFields):
    """What a patient sends from the public booking page."""

    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: date
    phone: str | None = None
    doctor_id: int
    start_time: datetime
    reason: str | None = None
    # Self-pay patients choose how to pay. For "card" the browser sends a payment token.
    payment_method: Literal["card", "at_clinic"] | None = None
    payment_token: str | None = None

    @model_validator(mode="after")
    def payment_only_for_self_pay(self):
        if self.insurance_provider is not None and self.payment_method is not None:
            raise ValueError("Insured visits are paid by the insurer, not online")
        if self.payment_method == "card" and not self.payment_token:
            raise ValueError("A card payment needs a payment token")
        return self


class BookingConfirmation(BaseModel):
    appointment_id: int
    patient_id: int
    doctor_name: str
    specialty: str
    start_time: datetime
    price_cents: int
    insurance_status: str
    billing_status: str
    payment_method: str | None
