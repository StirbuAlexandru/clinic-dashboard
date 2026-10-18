"""Demo data for the Clinic Dashboard, used by seed.py.

Appointments reference patients and doctors by their position in the lists below.
"""

from datetime import date, datetime

DOCTORS = [
    {"first_name": "Emily", "last_name": "Carter", "specialty": "Psychiatry"},
    {"first_name": "Michael", "last_name": "Brown", "specialty": "Family Medicine"},
    {"first_name": "Sofia", "last_name": "Martinez", "specialty": "Clinical Psychology"},
    {"first_name": "David", "last_name": "Kim", "specialty": "Pediatrics"},
]

PATIENTS = [
    {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "date_of_birth": date(1992, 7, 14),
        "phone": "555-0142",
        "insurance_provider": "Cigna",
        "insurance_member_id": "CG55512",
    },
    {
        "first_name": "James",
        "last_name": "Wilson",
        "date_of_birth": date(1978, 2, 3),
        "phone": "555-0187",
        "insurance_provider": "Aetna",
        "insurance_member_id": "AE78123",
    },
    {
        "first_name": "Olivia",
        "last_name": "Davis",
        "date_of_birth": date(2015, 11, 22),
        "phone": None,
        "insurance_provider": "Blue Cross",
        "insurance_member_id": "BC44871",
    },
    {
        # Member ID ends in 0 -> the mock eligibility check says "inactive"
        "first_name": "Robert",
        "last_name": "Garcia",
        "date_of_birth": date(1965, 9, 30),
        "phone": "555-0119",
        "insurance_provider": "UnitedHealthcare",
        "insurance_member_id": "UH90210",
    },
    {
        "first_name": "Emma",
        "last_name": "Thompson",
        "date_of_birth": date(1988, 4, 17),
        "phone": "555-0163",
        "insurance_provider": "Humana",
        "insurance_member_id": "HU33219",
    },
    {
        # Provider not supported -> the mock eligibility check says "inactive"
        "first_name": "Daniel",
        "last_name": "Lee",
        "date_of_birth": date(1999, 12, 5),
        "phone": "555-0175",
        "insurance_provider": "Oscar Health",
        "insurance_member_id": "OS12345",
    },
    {
        # No insurance -> self-pay, she pays the clinic directly
        "first_name": "Grace",
        "last_name": "Miller",
        "date_of_birth": date(1984, 6, 9),
        "phone": "555-0198",
        "insurance_provider": None,
        "insurance_member_id": None,
    },
]

# patient / doctor = index in PATIENTS / DOCTORS
APPOINTMENTS = [
    # June
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 6, 3, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "paid"},
    {"patient": 1, "doctor": 1, "start_time": datetime(2026, 6, 11, 9, 30), "price_cents": 9500, "reason": "Annual check-up", "billing_status": "paid"},
    {"patient": 2, "doctor": 3, "start_time": datetime(2026, 6, 18, 14, 0), "price_cents": 9000, "reason": "Pediatric check-up", "billing_status": "paid"},
    # July
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 7, 1, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "paid"},
    {"patient": 4, "doctor": 0, "start_time": datetime(2026, 7, 9, 11, 0), "price_cents": 22000, "reason": "Initial psychiatric evaluation", "billing_status": "paid"},
    {"patient": 1, "doctor": 1, "start_time": datetime(2026, 7, 22, 15, 30), "price_cents": 12000, "reason": "Blood pressure follow-up", "billing_status": "paid"},
    # August
    {"patient": 4, "doctor": 0, "start_time": datetime(2026, 8, 6, 11, 0), "price_cents": 18000, "reason": "Medication review", "billing_status": "paid"},
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 8, 12, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "paid"},
    {"patient": 3, "doctor": 1, "start_time": datetime(2026, 8, 20, 9, 0), "price_cents": 14000, "reason": "Diabetes follow-up", "billing_status": "denied"},
    {"patient": 2, "doctor": 3, "start_time": datetime(2026, 8, 27, 13, 30), "price_cents": 9000, "reason": "Vaccination", "billing_status": "paid"},
    # September
    {"patient": 4, "doctor": 0, "start_time": datetime(2026, 9, 3, 11, 0), "price_cents": 18000, "reason": "Medication review", "billing_status": "paid"},
    {"patient": 5, "doctor": 2, "start_time": datetime(2026, 9, 10, 16, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "denied"},
    {"patient": 1, "doctor": 1, "start_time": datetime(2026, 9, 17, 9, 30), "price_cents": 9500, "reason": "Lab results review", "billing_status": "paid"},
    {"patient": 6, "doctor": 2, "start_time": datetime(2026, 9, 21, 14, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "paid"},
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 9, 24, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "paid"},
    # October
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 10, 1, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "submitted"},
    {"patient": 4, "doctor": 0, "start_time": datetime(2026, 10, 8, 11, 0), "price_cents": 18000, "reason": "Medication review", "billing_status": "submitted"},
    {"patient": 2, "doctor": 3, "start_time": datetime(2026, 10, 14, 14, 0), "price_cents": 12000, "reason": "Ear infection", "billing_status": "submitted"},
    {"patient": 3, "doctor": 1, "start_time": datetime(2026, 10, 23, 9, 0), "price_cents": 14000, "reason": "Diabetes follow-up", "billing_status": "unpaid"},
    {"patient": 5, "doctor": 2, "start_time": datetime(2026, 10, 27, 16, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "unpaid"},
    {"patient": 6, "doctor": 2, "start_time": datetime(2026, 10, 29, 14, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "unpaid"},
    # November
    {"patient": 4, "doctor": 0, "start_time": datetime(2026, 11, 5, 11, 0), "price_cents": 18000, "reason": "Medication review", "billing_status": "unpaid"},
    {"patient": 0, "doctor": 2, "start_time": datetime(2026, 11, 12, 10, 0), "price_cents": 13000, "reason": "Therapy session", "billing_status": "unpaid"},
    {"patient": 1, "doctor": 1, "start_time": datetime(2026, 11, 19, 9, 30), "price_cents": 9500, "reason": "Annual check-up", "billing_status": "unpaid"},
]
