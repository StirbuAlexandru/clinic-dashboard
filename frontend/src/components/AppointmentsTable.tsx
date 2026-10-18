import { formatDateTime, formatMoney, isInTheFuture } from '../format'
import type { Appointment,BillingStatus, Doctor, Patient } from '../types'
import StatusBadge from './StatusBadge'

const NEXT_STATUSES: Record<BillingStatus, BillingStatus[]> = {
  unpaid: ['submitted'],
  submitted: ['paid', 'denied'],
  denied: ['submitted'],
  paid: [],
}

// Self-pay patients pay the clinic directly, there is no insurance claim
const SELF_PAY_NEXT_STATUSES: Record<BillingStatus, BillingStatus[]> = {
  unpaid: ['paid'],
  submitted: [],
  denied: [],
  paid: [],
}

function nextStatuses(appointment: Appointment) {
  const transitions =
    appointment.insurance_status === 'self_pay' ? SELF_PAY_NEXT_STATUSES : NEXT_STATUSES
  const next = transitions[appointment.billing_status]
  // A claim can only be sent to the insurer after the visit
  if (isInTheFuture(appointment.start_time)) {
    return next.filter((status) => status !== 'submitted')
  }
  return next
}



interface AppointmentsTableProps {
    appointments: Appointment[]
    patients: Patient[]
    doctors: Doctor[]
    onStatusChange: (id: number, status: BillingStatus) => void
}

function AppointmentsTable({ appointments, patients, doctors, onStatusChange }: AppointmentsTableProps) {


    function patientName(id: number) {
        const patient = patients.find((p) => p.id === id)
        return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'
    }
    function doctorName(id: number) {
        const doctor = doctors.find((d) => d.id === id)
        return doctor ? `${doctor.first_name} ${doctor.last_name}` : 'Unknown'
    }
    return (
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Price</th>
                    <th>Insurance</th>
                    <th>Billing</th>
                    <th>Actions</th>

                </tr>
            </thead>
            <tbody>
                {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                        <td>{formatDateTime(appointment.start_time)}</td>
                        <td>{patientName(appointment.patient_id)}</td>
                        <td>Dr. {doctorName(appointment.doctor_id)}</td>
                        <td>{formatMoney(appointment.price_cents)}</td>
                        <td><StatusBadge status={appointment.insurance_status} /></td>
                        <td><StatusBadge status={appointment.billing_status} /></td>
                        <td>
  {nextStatuses(appointment).map((status) => (
    <button key={status} onClick={() => onStatusChange(appointment.id, status)}>
      Mark {status}
    </button>
  ))}
  {nextStatuses(appointment).length === 0 && isInTheFuture(appointment.start_time) && (
    <span className="muted-note">Bill after the visit</span>
  )}
</td>


                    </tr>
                ))}
            </tbody>
        </table>
    )
}


export default AppointmentsTable

