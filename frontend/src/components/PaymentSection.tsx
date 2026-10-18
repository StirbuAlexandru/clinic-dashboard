import { Building2, CreditCard } from 'lucide-react'
import { DECLINED_TEST_CARD, TEST_CARD } from '../mockPaymentProvider'
import type { CardDetails } from '../mockPaymentProvider'
import type { PaymentMethod } from '../types'

interface PaymentSectionProps {
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  card: CardDetails
  onCardChange: (card: CardDetails) => void
}

// Step 4 of the booking form, only for self-pay patients
function PaymentSection({ method, onMethodChange, card, onCardChange }: PaymentSectionProps) {
  return (
    <div className="booking-step">
      <h3>
        <span className="step-number">4</span> Payment
      </h3>

      <div className="payment-options">
        <label className={method === 'card' ? 'payment-option selected' : 'payment-option'}>
          <input
            type="radio"
            name="payment-method"
            checked={method === 'card'}
            onChange={() => onMethodChange('card')}
          />
          <CreditCard size={22} />
          <span>
            <strong>Pay now by card</strong>
            Your visit is paid right away
          </span>
        </label>

        <label className={method === 'at_clinic' ? 'payment-option selected' : 'payment-option'}>
          <input
            type="radio"
            name="payment-method"
            checked={method === 'at_clinic'}
            onChange={() => onMethodChange('at_clinic')}
          />
          <Building2 size={22} />
          <span>
            <strong>Pay at the clinic</strong>
            Cash or card on the day of your visit
          </span>
        </label>
      </div>

      {method === 'card' && (
        <div className="card-form">
          <p className="demo-banner">
            <strong>Demo payment, no real money is taken.</strong> Use the test card {TEST_CARD} with any
            future date and any CVC. The card {DECLINED_TEST_CARD} simulates a declined payment.
          </p>

          <label className="card-number">
            Card number
            <input
              value={card.number}
              onChange={(e) => onCardChange({ ...card, number: e.target.value })}
              placeholder={TEST_CARD}
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </label>
          <label>
            Expiry
            <input
              value={card.expiry}
              onChange={(e) => onCardChange({ ...card, expiry: e.target.value })}
              placeholder="MM/YY"
              autoComplete="off"
              required
            />
          </label>
          <label>
            CVC
            <input
              value={card.cvc}
              onChange={(e) => onCardChange({ ...card, cvc: e.target.value })}
              placeholder="123"
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default PaymentSection
