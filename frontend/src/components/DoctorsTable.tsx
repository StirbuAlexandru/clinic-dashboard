import { formatMoney } from '../format'
import type { Doctor } from '../types'

interface DoctorsTableProps {
  doctors: Doctor[]
}

function DoctorsTable({ doctors }: DoctorsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Specialty</th>
          <th>Visit price</th>
        </tr>
      </thead>
      <tbody>
        {doctors.map((doctor) => (
          <tr key={doctor.id}>
            <td>Dr. {doctor.first_name} {doctor.last_name}</td>
            <td>{doctor.specialty}</td>
            <td>{formatMoney(doctor.visit_price_cents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DoctorsTable
