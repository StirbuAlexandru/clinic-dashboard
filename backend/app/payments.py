"""A fake payment provider, built like Stripe.

The card number never reaches this backend. In the browser, the (fake) payment
provider checks the card and gives back a token like "tok_demo_8f3a...".
Here we only "charge" that token. In a real app this function would call the
Stripe API with a secret key instead.
"""

import uuid

from fastapi import HTTPException

DEMO_TOKEN_PREFIX = "tok_demo_"


def charge(token: str, amount_cents: int) -> str:
    """Charge the card behind the token. Returns a payment reference."""
    if not token.startswith(DEMO_TOKEN_PREFIX):
        raise HTTPException(status_code=400, detail="Invalid payment token")

    # Like Stripe's test cards: some tokens simulate a declined card
    if "declined" in token:
        raise HTTPException(status_code=402, detail="Your card was declined. No money was taken.")

    return f"ch_demo_{uuid.uuid4().hex[:12]}"
