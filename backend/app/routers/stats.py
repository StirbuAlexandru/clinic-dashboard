from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import case, func, select


from .. import models, schemas
from ..database import get_db


router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=schemas.Stats)
def get_stats(db: Session = Depends(get_db)):
    query = select(
        models.Appointment.billing_status,
        func.count(models.Appointment.id),
        func.sum(models.Appointment.price_cents),
    ).group_by(models.Appointment.billing_status)
    rows = db.execute(query).all()

    counts = {"unpaid": 0, "submitted": 0, "paid": 0, "denied": 0}
    totals = {"unpaid": 0, "submitted": 0, "paid": 0, "denied": 0}
    for status, count, total_cents in rows:
        counts[status] = count
        totals[status] = total_cents

    return schemas.Stats(
        total_appointments=sum(counts.values()),
        appointments_by_status=counts,
        paid_cents=totals["paid"],
        pending_cents=totals["unpaid"] + totals["submitted"],
    )


@router.get("/monthly", response_model=list[schemas.MonthlyRevenue])
def get_monthly_revenue(db: Session = Depends(get_db)):
    appointment = models.Appointment
    month = func.strftime("%Y-%m", appointment.start_time)

    paid = case(
        (appointment.billing_status == "paid", appointment.price_cents), else_=0
    )
    pending = case(
        (
            appointment.billing_status.in_(["unpaid", "submitted"]),
            appointment.price_cents,
        ),
        else_=0,
    )

    query = (
        select(month, func.sum(paid), func.sum(pending)).group_by(month).order_by(month)
    )
    rows = db.execute(query).all()

    return [
        schemas.MonthlyRevenue(
            month=row_month, paid_cents=paid_total, pending_cents=pending_total
        )
        for row_month, paid_total, pending_total in rows
    ]
