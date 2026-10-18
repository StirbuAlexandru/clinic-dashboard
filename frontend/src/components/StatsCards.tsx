import type { Stats } from '../types'
import { CalendarCheck, CircleDollarSign, CircleX, Clock } from 'lucide-react'
import { formatMoney } from '../format'

interface StatsCardsProps {
  stats: Stats
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <section className="stats">
      <div className="stat-card">
        <div className="stat-icon"><CalendarCheck size={20} /></div>
        <span className="stat-label">Appointments</span>
        <span className="stat-value">{stats.total_appointments}</span>
        <span className="stat-hint">All visits, past and upcoming</span>
      </div>

      <div className="stat-card">
        <div className="stat-icon"><CircleDollarSign size={20} /></div>
        <span className="stat-label">Collected</span>
        <span className="stat-value">{formatMoney(stats.paid_cents)}</span>
        <span className="stat-hint">Already paid by insurers and patients</span>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-blue"><Clock size={20} /></div>
        <span className="stat-label">Pending</span>
        <span className="stat-value">{formatMoney(stats.pending_cents)}</span>
        <span className="stat-hint">Billed or to be billed, not paid yet</span>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-red"><CircleX size={20} /></div>
        <span className="stat-label">Denied claims</span>
        <span className="stat-value">{stats.appointments_by_status.denied}</span>
        <span className="stat-hint">Rejected by insurers, need a fix</span>
      </div>
    </section>
  )
}

export default StatsCards
