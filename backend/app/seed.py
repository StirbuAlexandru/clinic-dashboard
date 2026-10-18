from .import models
from .database import Base, SessionLocal, engine
from .insurance import check_eligibility
from .seed_data import APPOINTMENTS, DOCTORS, PATIENTS

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        doctors = [models.Doctor(**data) for data in DOCTORS]
        patients = [models.Patient(**data) for data in PATIENTS]
        db.add_all(doctors + patients)

        for data in APPOINTMENTS:
            patient = patients[data["patient"]]
            doctor = doctors[data["doctor"]]
            db.add(
                models.Appointment(
                    patient=patient,
                    doctor=doctor,
                    start_time=data["start_time"],
                    reason=data["reason"],
                    price_cents=data["price_cents"],
                    billing_status=data["billing_status"],
                    insurance_status=check_eligibility(
                        patient.insurance_provider, patient.insurance_member_id
                        ),
                    )
                )

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
    print("Database seeded with demo data")