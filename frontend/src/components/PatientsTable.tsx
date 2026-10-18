import { insuranceCardUrl } from '../api'
import type { Patient } from '../types'
import StatusBadge from './StatusBadge'

interface PatientsTableProps {
  patients: Patient[]
}

function PatientsTable({ patients }: PatientsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date of birth</th>
          <th>Phone</th>
          <th>Insurance</th>
          <th>Insurance member ID</th>
          <th>Insurance card</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.id}>
            <td>{patient.first_name} {patient.last_name}</td>
            <td>{patient.date_of_birth}</td>
            <td>{patient.phone ?? '—'}</td>
            <td>{patient.insurance_provider ?? 'Self-pay'}</td>
            <td>{patient.insurance_member_id ?? '—'}</td>
            <td>
              {patient.insurance_review ? (
                <a
                  href={insuranceCardUrl(patient.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="card-link"
                >
                  <StatusBadge status={patient.insurance_review} />
                </a>
              ) : (
                '—'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default PatientsTable
