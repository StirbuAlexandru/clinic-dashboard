"""Shared test setup.

Every test gets its own empty in-memory database, so the tests never touch
clinic.db and never depend on each other.
"""

from datetime import date, datetime, time, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import insurance_cards
from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """An API client that uses a fresh in-memory SQLite database."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    # Use the test database instead of the real one
    app.dependency_overrides[get_db] = override_get_db
    # Save uploaded insurance cards in a temporary folder
    monkeypatch.setattr(insurance_cards, "UPLOAD_DIR", tmp_path)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def doctor(client):
    response = client.post(
        "/doctors",
        json={"first_name": "Emily", "last_name": "Carter", "specialty": "Psychiatry"},
    )
    return response.json()


@pytest.fixture
def patient(client):
    """A patient with active insurance (Aetna, member ID not ending in 0)."""
    response = client.post(
        "/patients",
        json={
            "first_name": "James",
            "last_name": "Wilson",
            "date_of_birth": "1978-02-03",
            "insurance_provider": "Aetna",
            "insurance_member_id": "AE78123",
        },
    )
    return response.json()


@pytest.fixture
def next_week():
    """10:00 one week from now: always in the future and on the clinic's slot grid."""
    return datetime.combine(date.today() + timedelta(days=7), time(10))


@pytest.fixture
def last_week():
    return datetime.combine(date.today() - timedelta(days=7), time(10))
