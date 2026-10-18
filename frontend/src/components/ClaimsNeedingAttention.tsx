import { formatDate, formatMoney, personName } from '../format'
import type { Appointment, Patient } from '../types'

interface ClaimsNeedingAttentionProps {
  claims: Appointment[]
  patients: Patient[]
  onResubmit: (appointmentId: number) => void
}

function ClaimsNeedingAttention({ claims, patients, onResubmit }: ClaimsNeedingAttentionProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Claims needing attention</h2>
      <p className="panel-subtitle">Denied by the insurer. Fix the details and resubmit.</p>

      {claims.length === 0 && <p className="empty-state">Nothing to fix, all claims are on track.</p>}

      <ul className="item-list">
        {claims.map((claim) => {
          const patient = patients.find((p) => p.id === claim.patient_id)

          return (
            <li key={claim.id} className="item">
              <div className="item-main">
                <strong>{patient ? personName(patient) : 'Unknown patient'}</strong>
                <span>
                  {patient?.insurance_provider} · {formatDate(claim.start_time)} ·{' '}
                  {formatMoney(claim.price_cents)}
                </span>
              </div>
              <button className="button-small" onClick={() => onResubmit(claim.id)}>
                Resubmit
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ClaimsNeedingAttention
