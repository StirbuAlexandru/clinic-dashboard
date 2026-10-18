import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import {
  getAppointments,
  getDoctors,
  getMonthlyRevenue,
  getPatients,
  getStats,
  getUpcomingAppointments,
  reviewInsuranceCard,
  updateBillingStatus,
} from './api'
import AppointmentFilters from './components/AppointmentFilters'
import AppointmentsTable from './components/AppointmentsTable'
import DoctorsTable from './components/DoctorsTable'
import Header from './components/Header'
import NewAppointmentForm from './components/NewAppointmentForm'
import NewDoctorForm from './components/NewDoctorForm'
import NewPatientForm from './components/NewPatientForm'
import PatientsTable from './components/PatientsTable'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import type { Appointment, BillingStatus, Doctor, MonthlyRevenue, Patient, Stats } from './types'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/appointments': 'Appointments',
  '/admin/patients': 'Patients',
  '/admin/doctors': 'Doctors',
}

// The clinic staff app, shown at /admin
function App() {
  const location = useLocation()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [upcoming, setUpcoming] = useState<Appointment[]>([])
  const [deniedClaims, setDeniedClaims] = useState<Appointment[]>([])
  const [billingStatusFilter, setBillingStatusFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')

  // Everything shown on the dashboard. Called again after every change.
  function loadDashboard() {
    getPatients()
      .then((data) => setPatients(data))
      .catch((err: Error) => setError(err.message))
    getStats()
      .then((data) => setStats(data))
      .catch((err: Error) => setError(err.message))
    getMonthlyRevenue()
      .then((data) => setMonthlyRevenue(data))
      .catch((err: Error) => setError(err.message))
    getUpcomingAppointments()
      .then((data) => setUpcoming(data))
      .catch((err: Error) => setError(err.message))
    getAppointments('denied')
      .then((data) => setDeniedClaims(data))
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err: Error) => setError(err.message))
    loadDashboard()

    // When the staff comes back to this browser tab (for example after booking
    // in the patient portal), show the latest data
    window.addEventListener('focus', loadDashboard)
    return () => window.removeEventListener('focus', loadDashboard)
  }, [])

  // The appointments list, with the current filters. Reloaded when a filter
  // changes and when the staff comes back to this tab (new online bookings).
  useEffect(() => {
    function loadAppointments() {
      getAppointments(billingStatusFilter, doctorFilter)
        .then((data) => setAppointments(data))
        .catch((err: Error) => setError(err.message))
    }

    loadAppointments()
    window.addEventListener('focus', loadAppointments)
    return () => window.removeEventListener('focus', loadAppointments)
  }, [billingStatusFilter, doctorFilter])

  function handleCreated(appointment: Appointment) {
    setAppointments((current) => [...current, appointment])
    loadDashboard()
  }

  async function handleStatusChange(id: number, status: BillingStatus) {
    setError(null)
    try {
      const updated = await updateBillingStatus(id, status)
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === updated.id ? updated : appointment)),
      )
      loadDashboard()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleInsuranceReview(patientId: number, decision: 'approved' | 'rejected') {
    setError(null)
    try {
      await reviewInsuranceCard(patientId, decision)
      // The decision changes the insurance status of the patient's unbilled visits
      loadDashboard()
      const data = await getAppointments(billingStatusFilter, doctorFilter)
      setAppointments(data)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function handlePatientCreated(patient: Patient) {
    setPatients((current) => [...current, patient])
  }

  function handleDoctorCreated(doctor: Doctor) {
    setDoctors((current) => [...current, doctor])
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Header title={PAGE_TITLES[location.pathname] ?? 'Dashboard'} />

        <main>
          {error && <p className="form-error">Error: {error}</p>}

          <Routes>
            <Route
              index
              element={
                <DashboardPage
                  stats={stats}
                  monthlyRevenue={monthlyRevenue}
                  upcoming={upcoming}
                  deniedClaims={deniedClaims}
                  patients={patients}
                  doctors={doctors}
                  onStatusChange={handleStatusChange}
                  onInsuranceReview={handleInsuranceReview}
                />
              }
            />

            <Route
              path="appointments"
              element={
                <>
                  <NewAppointmentForm patients={patients} doctors={doctors} onCreated={handleCreated} />
                  <AppointmentFilters
                    doctors={doctors}
                    billingStatus={billingStatusFilter}
                    doctorId={doctorFilter}
                    onBillingStatusChange={setBillingStatusFilter}
                    onDoctorIdChange={setDoctorFilter}
                  />
                  <AppointmentsTable
                    appointments={appointments}
                    patients={patients}
                    doctors={doctors}
                    onStatusChange={handleStatusChange}
                  />
                </>
              }
            />

            <Route
              path="patients"
              element={
                <>
                  <NewPatientForm onCreated={handlePatientCreated} />
                  <PatientsTable patients={patients} />
                </>
              }
            />

            <Route
              path="doctors"
              element={
                <>
                  <NewDoctorForm onCreated={handleDoctorCreated} />
                  <DoctorsTable doctors={doctors} />
                </>
              }
            />

            {/* Unknown address inside /admin: go back to the dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
