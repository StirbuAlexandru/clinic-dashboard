from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (loads the models so create_all knows the tables)
from .database import Base, engine
from .routers import appointments, bookings, doctors, patients, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Clinic Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(stats.router)
app.include_router(bookings.router)


@app.get("/")
def read_root():
    return {"message": "Clinic Dashboard API is running"}
