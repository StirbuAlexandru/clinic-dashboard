"""Tests for the public patient portal: online booking, payment and insurance cards."""


def booking(doctor, start_time, **changes):
    """A valid booking request. Pass keyword arguments to change fields."""
    data = {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "date_of_birth": "1992-07-14",
        "phone": "555-0142",
        "insurance_provider": "Cigna",
        "insurance_member_id": "CG55512",
        "doctor_id": doctor["id"],
        "start_time": start_time.isoformat(),
        "reason": None,
        "payment_method": None,
        "payment_token": None,
    }
    data.update(changes)
    return data


SELF_PAY = {"insurance_provider": None, "insurance_member_id": None}


# ---------- Availability and booking ----------


def test_doctor_shows_visit_price(doctor):
    assert doctor["visit_price_cents"] == 18000


def test_booked_slot_disappears_from_availability(client, doctor, next_week):
    url = f"/doctors/{doctor['id']}/availability"
    day = next_week.date().isoformat()
    assert next_week.isoformat() in client.get(url, params={"day": day}).json()

    client.post("/bookings", json=booking(doctor, next_week))

    assert next_week.isoformat() not in client.get(url, params={"day": day}).json()


def test_booking_creates_patient_and_checks_insurance(client, doctor, next_week):
    response = client.post("/bookings", json=booking(doctor, next_week))

    assert response.status_code == 201
    body = response.json()
    assert body["insurance_status"] == "active"
    assert body["price_cents"] == 18000
    assert len(client.get("/patients").json()) == 1


def test_returning_patient_is_not_duplicated(client, doctor, next_week):
    client.post("/bookings", json=booking(doctor, next_week))
    client.post("/bookings", json=booking(doctor, next_week.replace(hour=11)))

    assert len(client.get("/patients").json()) == 1


def test_booking_a_taken_slot_returns_409(client, doctor, next_week):
    client.post("/bookings", json=booking(doctor, next_week))

    response = client.post("/bookings", json=booking(doctor, next_week, first_name="Ann"))

    assert response.status_code == 409


def test_booking_outside_the_slot_grid_returns_400(client, doctor, next_week):
    response = client.post("/bookings", json=booking(doctor, next_week.replace(minute=30)))

    assert response.status_code == 400


def test_insurance_provider_without_member_id_returns_422(client, doctor, next_week):
    response = client.post(
        "/bookings", json=booking(doctor, next_week, insurance_member_id=None)
    )

    assert response.status_code == 422


# ---------- Self-pay and the demo card payment ----------


def test_self_pay_card_payment_marks_visit_as_paid(client, doctor, next_week):
    response = client.post(
        "/bookings",
        json=booking(doctor, next_week, **SELF_PAY, payment_method="card", payment_token="tok_demo_abc"),
    )

    body = response.json()
    assert body["insurance_status"] == "self_pay"
    assert body["billing_status"] == "paid"
    assert body["payment_method"] == "card"


def test_declined_card_saves_nothing(client, doctor, next_week):
    response = client.post(
        "/bookings",
        json=booking(
            doctor, next_week, **SELF_PAY, payment_method="card", payment_token="tok_demo_declined_x"
        ),
    )

    assert response.status_code == 402
    assert client.get("/appointments").json() == []
    assert client.get("/patients").json() == []


def test_pay_at_clinic_stays_unpaid(client, doctor, next_week):
    response = client.post(
        "/bookings", json=booking(doctor, next_week, **SELF_PAY, payment_method="at_clinic")
    )

    assert response.json()["billing_status"] == "unpaid"


def test_insured_patients_cannot_pay_online(client, doctor, next_week):
    response = client.post(
        "/bookings",
        json=booking(doctor, next_week, payment_method="card", payment_token="tok_demo_abc"),
    )

    assert response.status_code == 422


# ---------- Insurance card upload and review ----------


def test_staff_approval_overrides_the_automatic_check(client, doctor, next_week):
    # Oscar Health is not supported, so the automatic check says "inactive"
    booked = client.post(
        "/bookings",
        json=booking(doctor, next_week, insurance_provider="Oscar Health", insurance_member_id="OS1"),
    ).json()
    assert booked["insurance_status"] == "inactive"
    patient_id = booked["patient_id"]

    upload = client.post(
        f"/patients/{patient_id}/insurance-card",
        files={"file": ("card.png", b"fake image", "image/png")},
    )
    assert upload.json()["insurance_review"] == "pending"

    review = client.patch(f"/patients/{patient_id}/insurance-review", json={"decision": "approved"})
    assert review.json()["insurance_review"] == "approved"
    assert client.get("/appointments").json()[0]["insurance_status"] == "active"


def test_card_upload_rejects_other_file_types(client, patient):
    response = client.post(
        f"/patients/{patient['id']}/insurance-card",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
