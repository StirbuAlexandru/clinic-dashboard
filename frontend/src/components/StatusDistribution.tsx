import type { BillingStatus, Stats } from '../types'

const STATUSES: { status: BillingStatus; label: string }[] = [
  { status: 'paid', label: 'Paid' },
  { status: 'submitted', label: 'Submitted' },
  { status: 'unpaid', label: 'Unpaid' },
  { status: 'denied', label: 'Denied' },
]

interface StatusDistributionProps {
  stats: Stats
}


function StatusDistribution({ stats }: StatusDistributionProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Billing status</h2>
      <p className="panel-subtitle">Where each appointment is in the billing process</p>

      {STATUSES.map(({ status, label }) => {
        const count = stats.appointments_by_status[status]
        const percent =
          stats.total_appointments === 0 ? 0 : Math.round((count / stats.total_appointments) * 100)

        return (
          <div key={status} className="distribution-row">
            <div className="distribution-label">
              <span>{label} · {count}</span>
              <strong>{percent}%</strong>
            </div>
            <div className="distribution-bar">
              <div className={`distribution-fill fill-${status}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatusDistribution
