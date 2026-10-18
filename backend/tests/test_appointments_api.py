"""Tests for the staff API: appointments, billing status and statistics."""


def create_appointment(client, patient, doctor, start_time, price_cents=15000):
    return client.post(
        "/appointments",
        json={
            "patient_id": patient["id"],
            "doctor_id": doctor["id"],
            "start_time": start_time.isoformat(),
            "price_cents": price_cents,
        },
    )


def test_create_appointment_checks_insurance(client, patient, doctor, next_week):
    response = create_appointment(client, patient, doctor, next_week)

    assert response.status_code == 201
    body = response.json()
    assert body["insurance_status"] == "active"
    assert body["billing_status"] == "unpaid"


def test_unknown_patient_returns_404(client, doctor, next_week):
    response = create_appointment(client, {"id": 999}, doctor, next_week)

    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"


def test_double_booking_a_doctor_returns_409(client, patient, doctor, next_week):
    create_appointment(client, patient, doctor, next_week)

    response = create_appointment(client, patient, doctor, next_week)

    assert response.status_code == 409


def test_client_cannot_set_billing_status_on_create(client, patient, doctor, next_week):
    response = client.post(
        "/appointments",
        json={
            "patient_id": patient["id"],
            "doctor_id": doctor["id"],
            "start_time": next_week.isoformat(),
            "price_cents": 15000,
            "billing_status": "paid",
        },
    )

    assert response.json()["billing_status"] == "unpaid"


def test_full_claim_flow(client, patient, doctor, last_week):
    appointment = create_appointment(client, patient, doctor, last_week).json()
    url = f"/appointments/{appointment['id']}/billing"

    assert client.patch(url, json={"status": "submitted"}).json()["billing_status"] == "submitted"
    assert client.patch(url, json={"status": "denied"}).json()["billing_status"] == "denied"
    assert client.patch(url, json={"status": "submitted"}).json()["billing_status"] == "submitted"
    assert client.patch(url, json={"status": "paid"}).json()["billing_status"] == "paid"


def test_invalid_transition_returns_400(client, patient, doctor, last_week):
    appointment = create_appointment(client, patient, doctor, last_week).json()

    response = client.patch(f"/appointments/{appointment['id']}/billing", json={"status": "paid"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot change billing status from unpaid to paid"


def test_unknown_status_returns_422(client, patient, doctor, last_week):
    appointment = create_appointment(client, patient, doctor, last_week).json()

    response = client.patch(f"/appointments/{appointment['id']}/billing", json={"status": "abc"})

    assert response.status_code == 422


def test_claim_cannot_be_submitted_before_the_visit(client, patient, doctor, next_week):
    appointment = create_appointment(client, patient, doctor, next_week).json()

    response = client.patch(
        f"/appointments/{appointment['id']}/billing", json={"status": "submitted"}
    )

    assert response.status_code == 400


def test_filter_by_billing_status(client, patient, doctor, last_week, next_week):
    first = create_appointment(client, patient, doctor, last_week).json()
    create_appointment(client, patient, doctor, next_week)
    client.patch(f"/appointments/{first['id']}/billing", json={"status": "submitted"})

    response = client.get("/appointments", params={"billing_status": "submitted"})

    assert [a["id"] for a in response.json()] == [first["id"]]


def test_stats_group_appointments_by_billing_status(client, patient, doctor, last_week, next_week):
    first = create_appointment(client, patient, doctor, last_week, price_cents=10000).json()
    create_appointment(client, patient, doctor, next_week, price_cents=5000)
    url = f"/appointments/{first['id']}/billing"
    client.patch(url, json={"status": "submitted"})
    client.patch(url, json={"status": "paid"})

    stats = client.get("/stats").json()

    assert stats["total_appointments"] == 2
    assert stats["appointments_by_status"]["paid"] == 1
    assert stats["paid_cents"] == 10000
    assert stats["pending_cents"] == 5000
