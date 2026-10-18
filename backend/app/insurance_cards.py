"""Saving insurance card photos and applying the staff's review decision.

Demo note: real insurance cards are protected health information (HIPAA).
In production they would be stored encrypted (for example in S3) and only
authenticated staff could see them.
"""

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "insurance_cards"
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "application/pdf": ".pdf"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def save_card(patient: models.Patient, file: UploadFile) -> None:
    """Check the file, save it on disk and mark the card as waiting for review."""
    extension = ALLOWED_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG or PDF file")

    content = file.file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="The file is too large (maximum 5 MB)")

    # A random name, so files never overwrite each other and the name can't be guessed
    filename = f"patient_{patient.id}_{uuid.uuid4().hex}{extension}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / filename).write_bytes(content)

    patient.insurance_card_filename = filename
    patient.insurance_review = "pending"


def card_path(patient: models.Patient) -> Path:
    if patient.insurance_card_filename is None:
        raise HTTPException(status_code=404, detail="This patient has no insurance card")
    return UPLOAD_DIR / patient.insurance_card_filename


def apply_review(db: Session, patient: models.Patient, decision: str) -> None:
    """Approve or reject the card.

    The staff decision overrides the automatic eligibility check for the
    appointments that were not billed yet (billing status "unpaid").
    """
    if patient.insurance_card_filename is None:
        raise HTTPException(status_code=400, detail="There is no insurance card to review")

    patient.insurance_review = decision
    new_insurance_status = "active" if decision == "approved" else "inactive"

    query = select(models.Appointment).where(
        models.Appointment.patient_id == patient.id,
        models.Appointment.billing_status == "unpaid",
    )
    for appointment in db.scalars(query):
        appointment.insurance_status = new_insurance_status
