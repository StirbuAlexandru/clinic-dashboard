from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session


from .. import models, schemas
from ..database import get_db
from ..insurance_cards import apply_review, card_path, save_card

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("", response_model=schemas.PatientRead, status_code=201)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("", response_model=list[schemas.PatientRead])
def list_patients(db: Session = Depends(get_db)):
    return db.scalars(select(models.Patient)).all()


@router.get("/{patient_id}", response_model=schemas.PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


def get_patient_or_404(db: Session, patient_id: int) -> models.Patient:
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/{patient_id}/insurance-card", response_model=schemas.PatientRead)
def upload_insurance_card(patient_id: int, file: UploadFile, db: Session = Depends(get_db)):
    """The patient uploads a photo of their insurance card (JPG, PNG or PDF)."""
    patient = get_patient_or_404(db, patient_id)
    save_card(patient, file)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}/insurance-card")
def get_insurance_card(patient_id: int, db: Session = Depends(get_db)):
    """The staff opens the uploaded card."""
    patient = get_patient_or_404(db, patient_id)
    return FileResponse(card_path(patient))


@router.patch("/{patient_id}/insurance-review", response_model=schemas.PatientRead)
def review_insurance_card(
    patient_id: int,
    review: schemas.InsuranceReviewUpdate,
    db: Session = Depends(get_db),
):
    """The staff approves or rejects the uploaded card."""
    patient = get_patient_or_404(db, patient_id)
    apply_review(db, patient, review.decision)
    db.commit()
    db.refresh(patient)
    return patient
