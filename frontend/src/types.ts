export type InsuranceStatus = 'unknown' | 'active' | 'inactive' | 'self_pay'
export type BillingStatus = 'unpaid' | 'submitted' | 'paid' | 'denied' 
export type PatientCreate = Omit<Patient, 'id' | 'insurance_card_filename' | 'insurance_review'>
export type InsuranceReview = 'pending' | 'approved' | 'rejected'
export type DoctorCreate = Omit<Doctor, 'id' | 'visit_price_cents'>




//programarea
export interface Appointment {
    id: number
    patient_id: number
    doctor_id: number
    start_time: string
    reason: string | null
    price_cents: number
    insurance_status: InsuranceStatus
    billing_status: BillingStatus
}

//doctor
export interface Doctor {
    id: number
    first_name: string
    last_name: string
    specialty: string
    // Calculated by the backend from the specialty
    visit_price_cents: number
}

export interface AppointmentCreate{
    patient_id: number
    doctor_id: number
    start_time: string
    reason: string | null
    price_cents: number
}

export interface Stats {
  total_appointments: number
  appointments_by_status: Record<BillingStatus, number>
  paid_cents: number
  pending_cents: number
}

export interface Patient {
    id: number
    first_name: string
    last_name: string
    date_of_birth: string
    phone: string | null
    // Both null for self-pay patients (no insurance)
    insurance_provider: string | null
    insurance_member_id: string | null
    // Insurance card photo uploaded from the patient portal (null if none)
    insurance_card_filename: string | null
    insurance_review: InsuranceReview | null
}

export interface MonthlyRevenue {
  month: string
  paid_cents: number
  pending_cents: number
}



// Sent by the public booking page (patient portal)
export interface BookingCreate {
  first_name: string
  last_name: string
  date_of_birth: string
  phone: string | null
  insurance_provider: string | null
  insurance_member_id: string | null
  doctor_id: number
  start_time: string
  reason: string | null
  // Only for self-pay patients
  payment_method: PaymentMethod | null
  payment_token: string | null
}

export type PaymentMethod = 'card' | 'at_clinic'

export interface BookingConfirmation {
  appointment_id: number
  patient_id: number
  doctor_name: string
  specialty: string
  start_time: string
  price_cents: number
  insurance_status: InsuranceStatus
  billing_status: BillingStatus
  payment_method: PaymentMethod | null
}

