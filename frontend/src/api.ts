import { localDateTimeNow } from './format'
import type {
  Appointment,
  AppointmentCreate,
  BillingStatus,
  BookingConfirmation,
  BookingCreate,
  Doctor,
  DoctorCreate,
  InsuranceReview,
  MonthlyRevenue,
  Patient,
  PatientCreate,
  Stats,
} from './types'



const API_URL = 'http://127.0.0.1:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    // Files are sent as FormData: the browser sets the right Content-Type itself
    const isFile = options?.body instanceof FormData
    const response = await fetch(`${API_URL}${path}`, {
        headers: isFile ? undefined : { 'Content-Type': 'application/json' },
        ...options,
    })
    if (!response.ok) {
        const body = await response.json();
        throw new Error(typeof body.detail === 'string' ? body.detail : 'Request failed')
    }
    return response.json()
}

export function getAppointments(billingStatus = '', doctorId = '') {
  const params = new URLSearchParams()
  if (billingStatus) params.set('billing_status', billingStatus)
  if (doctorId) params.set('doctor_id', doctorId)
  return request<Appointment[]>(`/appointments?${params}`)
}



export function getPatients() {
    return request<Patient[]>('/patients')
}

export function getDoctors() {
    return request<Doctor[]>('/doctors')
}


export function createAppointment(data: AppointmentCreate) {
    return request<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
    })


}
export function updateBillingStatus(id: number, status: BillingStatus) {
    return request<Appointment>(`/appointments/${id}/billing`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    })
}

export function getStats() {
    return request<Stats>('/stats')
}

export function createPatient(data: PatientCreate) {
  return request<Patient>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function createDoctor(data: DoctorCreate) {
  return request<Doctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getMonthlyRevenue() {
  return request<MonthlyRevenue[]>('/stats/monthly')
}

// The next appointments from now on, for the dashboard
export function getUpcomingAppointments(limit = 5) {
  const params = new URLSearchParams({ start_from: localDateTimeNow(), limit: String(limit) })
  return request<Appointment[]>(`/appointments?${params}`)
}

// Free time slots of a doctor on one day ("2026-10-20")
export function getAvailability(doctorId: number, day: string) {
  return request<string[]>(`/doctors/${doctorId}/availability?day=${day}`)
}

export function uploadInsuranceCard(patientId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<Patient>(`/patients/${patientId}/insurance-card`, {
    method: 'POST',
    body: formData,
  })
}

// Address of the uploaded card, used in <img> and in links
export function insuranceCardUrl(patientId: number) {
  return `${API_URL}/patients/${patientId}/insurance-card`
}

export function reviewInsuranceCard(patientId: number, decision: Exclude<InsuranceReview, 'pending'>) {
  return request<Patient>(`/patients/${patientId}/insurance-review`, {
    method: 'PATCH',
    body: JSON.stringify({ decision }),
  })
}

export function createBooking(data: BookingCreate) {
  return request<BookingConfirmation>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

