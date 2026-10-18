import { Link } from 'react-router'
import { formatTime, personName } from '../format'
import type { Appointment, Doctor, Patient } from '../types'
import StatusBadge from './StatusBadge'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
  patients: Patient[]
  doctors: Doctor[]
}

function UpcomingAppointments({ appointments, patients, doctors }: UpcomingAppointmentsProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Upcoming appointments</h2>
          <p className="panel-subtitle">The next visits on the schedule</p>
        </div>
        <Link to="/admin/appointments" className="panel-link">
          View all
        </Link>
      </div>

      {appointments.length === 0 && <p className="empty-state">No upcoming appointments.</p>}

      <ul className="item-list">
        {appointments.map((appointment) => {
          const patient = patients.find((p) => p.id === appointment.patient_id)
          const doctor = doctors.find((d) => d.id === appointment.doctor_id)
          const date = new Date(appointment.start_time)

          return (
            <li key={appointment.id} className="item">
              <div className="date-chip">
                <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                <strong>{date.getDate()}</strong>
              </div>
              <div className="item-main">
                <strong>{patient ? personName(patient) : 'Unknown patient'}</strong>
                <span>
                  {formatTime(appointment.start_time)} · Dr. {doctor ? personName(doctor) : 'Unknown'}
                  {doctor && ` · ${doctor.specialty}`}
                </span>
              </div>
              <StatusBadge status={appointment.insurance_status} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default UpcomingAppointments
