"""Unit tests for the business rules, without the API."""

from datetime import date, datetime

from app.billing import can_change_status, visit_price_cents
from app.insurance import check_eligibility
from app.scheduling import day_slots, overlaps


# ---------- Insurance eligibility (mock) ----------


def test_supported_provider_is_active():
    assert check_eligibility("Aetna", "AE78123") == "active"


def test_unsupported_provider_is_inactive():
    assert check_eligibility("Oscar Health", "OS12345") == "inactive"


def test_member_id_ending_in_zero_is_inactive():
    assert check_eligibility("UnitedHealthcare", "UH90210") == "inactive"


def test_no_insurance_is_self_pay():
    assert check_eligibility(None, None) == "self_pay"


# ---------- Billing state machine ----------


def test_insured_claim_follows_the_allowed_path():
    assert can_change_status("unpaid", "submitted")
    assert can_change_status("submitted", "paid")
    assert can_change_status("submitted", "denied")
    assert can_change_status("denied", "submitted")


def test_insured_visit_cannot_skip_the_claim():
    assert not can_change_status("unpaid", "paid")


def test_paid_is_final():
    for status in ["unpaid", "submitted", "denied"]:
        assert not can_change_status("paid", status)


def test_self_pay_is_paid_directly():
    assert can_change_status("unpaid", "paid", self_pay=True)
    assert not can_change_status("unpaid", "submitted", self_pay=True)


def test_visit_price_depends_on_specialty():
    assert visit_price_cents("Psychiatry") == 18000
    assert visit_price_cents("Pediatrics") == 9000
    assert visit_price_cents("Dermatology") == 12000  # default price


# ---------- Scheduling ----------


def test_clinic_offers_hourly_slots_from_9_to_16():
    slots = day_slots(date(2026, 11, 2))
    assert len(slots) == 8
    assert slots[0] == datetime(2026, 11, 2, 9, 0)
    assert slots[-1] == datetime(2026, 11, 2, 16, 0)


def test_appointments_less_than_an_hour_apart_overlap():
    booked = [datetime(2026, 11, 2, 10, 0)]
    assert overlaps(datetime(2026, 11, 2, 10, 30), booked)
    assert not overlaps(datetime(2026, 11, 2, 11, 0), booked)
