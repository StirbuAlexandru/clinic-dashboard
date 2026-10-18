import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CalendarCheck, Clock, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react'
import { getDoctors } from '../api'
import BookingForm from '../components/BookingForm'
import { formatMoney, personName } from '../format'
import type { Doctor } from '../types'

const SPECIALTY_DESCRIPTIONS: Record<string, string> = {
  Psychiatry: 'Diagnosis and medication management for mental health conditions.',
  'Clinical Psychology': 'Talk therapy for anxiety, stress, depression and life changes.',
  'Family Medicine': 'Check-ups, prevention and everyday care for the whole family.',
  Pediatrics: 'Care for babies, children and teenagers.',
}

// Public website of the clinic, shown at /
function PatientPortal() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err: Error) => setError(err.message))
  }, [])

  function bookWith(doctor: Doctor) {
    setSelectedDoctorId(String(doctor.id))
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="portal">
      <header className="portal-nav">
        <div className="portal-logo">
          <HeartPulse size={26} />
          Riverside Clinic
        </div>
        <nav className="portal-links">
          <a href="#doctors">Our doctors</a>
          <a href="#booking">Book a visit</a>
          <Link to="/admin" className="portal-staff-link">
            Staff dashboard
          </Link>
        </nav>
      </header>

      <section className="portal-hero">
        <div className="portal-hero-text">
          <span className="portal-eyebrow">Medical and mental health care</span>
          <h1>Care for body and mind, booked in two minutes.</h1>
          <p>
            Choose a doctor, pick a free time and we check your insurance right away. No phone
            calls, no waiting.
          </p>
          <a href="#booking" className="portal-cta">
            Book an appointment
          </a>
        </div>

        <ul className="portal-features">
          <li>
            <ShieldCheck size={22} />
            <div>
              <strong>Insurance checked instantly</strong>
              <span>We verify your coverage while you book.</span>
            </div>
          </li>
          <li>
            <Clock size={22} />
            <div>
              <strong>Real-time availability</strong>
              <span>You only see the times that are still free.</span>
            </div>
          </li>
          <li>
            <CalendarCheck size={22} />
            <div>
              <strong>Confirmed right away</strong>
              <span>Your visit goes straight into the clinic's schedule.</span>
            </div>
          </li>
        </ul>
      </section>

      <section id="doctors" className="portal-section">
        <h2>Our doctors</h2>
        <p className="portal-section-intro">
          A small team covering mental health and everyday medicine.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="doctor-card">
              <div className="doctor-avatar">
                <Stethoscope size={22} />
              </div>
              <h3>Dr. {personName(doctor)}</h3>
              <span className="doctor-specialty">{doctor.specialty}</span>
              <p>{SPECIALTY_DESCRIPTIONS[doctor.specialty] ?? 'Specialist at Riverside Clinic.'}</p>
              <span className="doctor-price">{formatMoney(doctor.visit_price_cents)} per visit</span>
              <button onClick={() => bookWith(doctor)}>Book with Dr. {doctor.last_name}</button>
            </article>
          ))}
        </div>
      </section>

      <section id="booking" className="portal-section">
        <h2>Book an appointment</h2>
        <p className="portal-section-intro">A few quick steps. It takes about two minutes.</p>
        <BookingForm
          doctors={doctors}
          doctorId={selectedDoctorId}
          onDoctorChange={setSelectedDoctorId}
        />
      </section>

      <footer className="portal-footer">
        Riverside Clinic · Demo project for a portfolio, not a real clinic
      </footer>
    </div>
  )
}

export default PatientPortal
