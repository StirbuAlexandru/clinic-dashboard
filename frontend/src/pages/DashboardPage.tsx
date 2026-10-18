import ClaimsNeedingAttention from '../components/ClaimsNeedingAttention'
import InsuranceReviewPanel from '../components/InsuranceReviewPanel'
import RevenueChart from '../components/RevenueChart'
import StatsCards from '../components/StatsCards'
import StatusDistribution from '../components/StatusDistribution'
import UpcomingAppointments from '../components/UpcomingAppointments'
import type { Appointment, BillingStatus, Doctor, MonthlyRevenue, Patient, Stats } from '../types'

interface DashboardPageProps {
  stats: Stats | null
  monthlyRevenue: MonthlyRevenue[]
  upcoming: Appointment[]
  deniedClaims: Appointment[]
  patients: Patient[]
  doctors: Doctor[]
  onStatusChange: (id: number, status: BillingStatus) => void
  onInsuranceReview: (patientId: number, decision: 'approved' | 'rejected') => void
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardPage({
  stats,
  monthlyRevenue,
  upcoming,
  deniedClaims,
  patients,
  doctors,
  onStatusChange,
  onInsuranceReview,
}: DashboardPageProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <div className="welcome">
        <h2>{greeting()}, Alexandru</h2>
        <p>{today} · Here is how the clinic is doing.</p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="dashboard-grid">
        <RevenueChart data={monthlyRevenue} />
        {stats && <StatusDistribution stats={stats} />}
      </div>

      <div className="dashboard-grid">
        <UpcomingAppointments appointments={upcoming} patients={patients} doctors={doctors} />
        <ClaimsNeedingAttention
          claims={deniedClaims}
          patients={patients}
          onResubmit={(id) => onStatusChange(id, 'submitted')}
        />
      </div>

      <InsuranceReviewPanel patients={patients} onReview={onInsuranceReview} />
    </>
  )
}

export default DashboardPage
