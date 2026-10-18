import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CircleCheck } from 'lucide-react'
import { createBooking, getAvailability, uploadInsuranceCard } from '../api'
import { formatDate, formatMoney, formatTime, personName, todayString } from '../format'
import { createCardToken } from '../mockPaymentProvider'
import type { CardDetails } from '../mockPaymentProvider'
import type { BookingConfirmation, Doctor, PaymentMethod } from '../types'
import PaymentSection from './PaymentSection'

const INSURANCE_PROVIDERS = [
  'Aetna',
  'Anthem',
  'Blue Cross',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Molina Healthcare',
  'UnitedHealthcare',
  'WellCare',
]

interface BookingFormProps {
  doctors: Doctor[]
  doctorId: string
  onDoctorChange: (doctorId: string) => void
}

function BookingForm({ doctors, doctorId, onDoctorChange }: BookingFormProps) {
  // Step 2: day and time
  const [day, setDay] = useState(todayString())
  const [slots, setSlots] = useState<string[]>([])
  const [slot, setSlot] = useState('')

  // Step 3: patient details
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [selfPay, setSelfPay] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [memberId, setMemberId] = useState('')
  const [cardFile, setCardFile] = useState<File | null>(null)
  const [reason, setReason] = useState('')

  // Step 4 (self-pay only): payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState<CardDetails>({ number: '', expiry: '', cvc: '' })

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [cardUploaded, setCardUploaded] = useState(false)
  const [paidCardLast4, setPaidCardLast4] = useState('')

  function loadSlots() {
    if (!doctorId || !day) return
    getAvailability(Number(doctorId), day)
      .then((data) => setSlots(data))
      .catch((err: Error) => setError(err.message))
  }

  // Ask the API for free times whenever the doctor or the day changes
  useEffect(loadSlots, [doctorId, day])

  // A slot chosen earlier is only valid if it is still in the free list
  const selectedSlot = doctorId && slots.includes(slot) ? slot : ''

  // Shown in the summary, so the patient sees the price before confirming
  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === doctorId)
  const paysByCard = selfPay && paymentMethod === 'card'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedSlot) {
      setError('Please choose a time for your visit.')
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      // 1. The payment provider turns the card into a token, in the browser.
      //    The card number is never sent to our backend.
      let paymentToken: string | null = null
      if (paysByCard) {
        paymentToken = await createCardToken(card)
      }

      // 2. Book the visit. For card payments the backend charges the token.
      const result = await createBooking({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        phone: phone || null,
        insurance_provider: selfPay ? null : insuranceProvider,
        insurance_member_id: selfPay ? null : memberId,
        doctor_id: Number(doctorId),
        start_time: selectedSlot,
        reason: reason || null,
        payment_method: selfPay ? paymentMethod : null,
        payment_token: paymentToken,
      })

      // 3. Send the insurance card photo for the patient we just booked for.
      // If only the upload fails, the appointment is still booked.
      let uploaded = false
      if (!selfPay && cardFile) {
        try {
          await uploadInsuranceCard(result.patient_id, cardFile)
          uploaded = true
        } catch {
          uploaded = false
        }
      }
      setCardUploaded(uploaded)
      setPaidCardLast4(paysByCard ? card.number.replace(/\s/g, '').slice(-4) : '')
      setConfirmation(result)
    } catch (err) {
      // For example 409 (someone booked this time a moment ago) or 402 (card declined)
      setError((err as Error).message)
      loadSlots()
    } finally {
      setSubmitting(false)
    }
  }

  function bookAnother() {
    setConfirmation(null)
    setSlot('')
    setReason('')
    setCardFile(null)
    setCard({ number: '', expiry: '', cvc: '' })
    loadSlots()
  }

  if (confirmation) {
    const insuranceIsActive = confirmation.insurance_status === 'active'
    const isSelfPay = confirmation.insurance_status === 'self_pay'

    let insuranceMessage = 'We could not verify your insurance. Please bring your insurance card to the visit.'
    if (insuranceIsActive) {
      insuranceMessage = `Your insurance is active. We will bill ${insuranceProvider} directly.`
    } else if (isSelfPay && confirmation.billing_status === 'paid') {
      insuranceMessage = `Payment received: ${formatMoney(confirmation.price_cents)} by card ending in ${paidCardLast4}. Nothing to pay at the clinic.`
    } else if (isSelfPay) {
      insuranceMessage = `You chose to pay at the clinic: ${formatMoney(confirmation.price_cents)} on the day of your visit.`
    } else if (cardUploaded) {
      insuranceMessage =
        'We could not verify your insurance automatically. Our team will check the card you uploaded.'
    }

    return (
      <div className="booking-card booking-confirmation">
        <CircleCheck size={44} className="booking-success-icon" />
        <h3>Your appointment is booked!</h3>
        <p className="booking-when">
          {formatDate(confirmation.start_time)} at {formatTime(confirmation.start_time)}
        </p>
        <p>
          Dr. {confirmation.doctor_name} · {confirmation.specialty} ·{' '}
          {formatMoney(confirmation.price_cents)}
        </p>
        <p className={insuranceIsActive || isSelfPay ? 'insurance-note ok' : 'insurance-note warning'}>
          {insuranceMessage}
        </p>
        {cardUploaded && <p className="booking-hint">We received your insurance card photo.</p>}
        <button onClick={bookAnother}>Book another appointment</button>
      </div>
    )
  }

  return (
    <form className="booking-card" onSubmit={handleSubmit}>
      <div className="booking-step">
        <h3>
          <span className="step-number">1</span> Choose a doctor
        </h3>
        <select value={doctorId} onChange={(e) => onDoctorChange(e.target.value)} required>
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {personName(doctor)} ({doctor.specialty}) · {formatMoney(doctor.visit_price_cents)}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-step">
        <h3>
          <span className="step-number">2</span> Pick a day and time
        </h3>
        <input
          type="date"
          value={day}
          min={todayString()}
          onChange={(e) => setDay(e.target.value)}
          required
        />

        {!doctorId && <p className="booking-hint">Choose a doctor to see the free times.</p>}
        {doctorId && slots.length === 0 && (
          <p className="booking-hint">No free times on this day. Please try another date.</p>
        )}
        {doctorId && slots.length > 0 && (
          <div className="slot-grid">
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                className={time === selectedSlot ? 'slot selected' : 'slot'}
                onClick={() => setSlot(time)}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="booking-step">
        <h3>
          <span className="step-number">3</span> Your details
        </h3>
        <div className="booking-fields">
          <label>
            First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label>
            Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label>
            Date of birth
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="checkbox-label booking-wide">
            <input type="checkbox" checked={selfPay} onChange={(e) => setSelfPay(e.target.checked)} />
            I don't have insurance, I'll pay myself
          </label>

          {!selfPay && (
            <>
              <label>
                Insurance provider
                <input
                  list="insurance-providers"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  required
                />
                <datalist id="insurance-providers">
                  {INSURANCE_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider} />
                  ))}
                </datalist>
              </label>
              <label>
                Insurance member ID
                <input
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. AE78123"
                  required
                />
                <span className="field-hint">Printed on the front of your insurance card</span>
              </label>
              <label className="booking-wide">
                Photo of your insurance card (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setCardFile(e.target.files?.[0] ?? null)}
                />
                <span className="field-hint">
                  JPG, PNG or PDF, up to 5 MB. Our team checks it before your visit.
                </span>
              </label>
            </>
          )}
          <label className="booking-wide">
            Reason for the visit (optional)
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </div>
      </div>

      {selfPay && (
        <PaymentSection
          method={paymentMethod}
          onMethodChange={setPaymentMethod}
          card={card}
          onCardChange={setCard}
        />
      )}

      {selectedDoctor && (
        <div className="booking-summary">
          <div>
            <span className="booking-summary-label">Your visit</span>
            <strong>
              Dr. {personName(selectedDoctor)} · {selectedDoctor.specialty}
            </strong>
            <span>
              {selectedSlot
                ? `${formatDate(selectedSlot)} at ${formatTime(selectedSlot)}`
                : 'Choose a time above'}
            </span>
          </div>
          <div className="booking-summary-price">
            <span className="booking-summary-label">Price</span>
            <strong>{formatMoney(selectedDoctor.visit_price_cents)}</strong>
            <span>
              {!selfPay && 'Billed to your insurance'}
              {paysByCard && 'Paid now by card'}
              {selfPay && !paysByCard && 'You pay at the clinic'}
            </span>
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="booking-submit" disabled={submitting}>
        {submitting && 'Processing...'}
        {!submitting && paysByCard && selectedDoctor &&
          `Pay ${formatMoney(selectedDoctor.visit_price_cents)} and book`}
        {!submitting && !(paysByCard && selectedDoctor) && 'Confirm booking'}
      </button>
    </form>
  )
}

export default BookingForm
