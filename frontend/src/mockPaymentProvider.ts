// A fake payment provider that works like Stripe.js, for the demo only.
//
// The card number stays in the browser: this "provider" checks the card and
// returns a token. Our backend only ever receives the token, never the card.
// With real Stripe, this file would be replaced by Stripe's own library.

export interface CardDetails {
  number: string
  expiry: string // "MM/YY"
  cvc: string
}

// Stripe-style test cards
export const TEST_CARD = '4242 4242 4242 4242'
export const DECLINED_TEST_CARD = '4000 0000 0000 0002'

// The Luhn check: the last digit of every real card number is a checksum
function passesLuhnCheck(digits: string) {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

function isInTheFuture(expiry: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  // A card is valid until the end of its expiry month
  return new Date(year, month, 1) > new Date()
}

export function createCardToken(card: CardDetails): Promise<string> {
  const digits = card.number.replace(/\s/g, '')

  return new Promise((resolve, reject) => {
    // Wait a moment, like a real payment provider
    setTimeout(() => {
      if (!/^\d{16}$/.test(digits) || !passesLuhnCheck(digits)) {
        reject(new Error('The card number is not valid.'))
      } else if (!isInTheFuture(card.expiry)) {
        reject(new Error('The expiry date must be in the future (MM/YY).'))
      } else if (!/^\d{3,4}$/.test(card.cvc)) {
        reject(new Error('The CVC must have 3 or 4 digits.'))
      } else {
        const random = Math.random().toString(36).slice(2, 12)
        const declined = digits === DECLINED_TEST_CARD.replace(/\s/g, '')
        resolve(declined ? `tok_demo_declined_${random}` : `tok_demo_${random}`)
      }
    }, 600)
  })
}
