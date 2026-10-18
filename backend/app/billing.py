ALLOWED_TRANSITIONS = {
    "unpaid": {"submitted"},
    "submitted": {"paid", "denied"},
    "denied": {"submitted"},
    "paid": set(),
}

# Self-pay patients pay the clinic directly: there is no insurance claim to submit
SELF_PAY_TRANSITIONS = {
    "unpaid": {"paid"},
    "submitted": set(),
    "denied": set(),
    "paid": set(),
}

# Price of a visit booked online, by the doctor's specialty
VISIT_PRICES_CENTS = {
    "Psychiatry": 18000,
    "Clinical Psychology": 13000,
    "Family Medicine": 9500,
    "Pediatrics": 9000,
}
DEFAULT_VISIT_PRICE_CENTS = 12000


def can_change_status(current: str, new: str, self_pay: bool = False) -> bool:
    transitions = SELF_PAY_TRANSITIONS if self_pay else ALLOWED_TRANSITIONS
    return new in transitions[current]


def visit_price_cents(specialty: str) -> int:
    return VISIT_PRICES_CENTS.get(specialty, DEFAULT_VISIT_PRICE_CENTS)
