import { CalendarDays, ExternalLink, HeartPulse, LayoutDashboard, Stethoscope, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'

const PAGES: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/patients', label: 'Patients', icon: Users },
  { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
]

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <HeartPulse size={26} />
        Clinic Dashboard
      </div>

      {PAGES.map((page) => (
        <NavLink
          key={page.to}
          to={page.to}
          end
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <page.icon size={18} />
          {page.label}
        </NavLink>
      ))}

      <a className="nav-item sidebar-portal-link" href="/" target="_blank" rel="noreferrer">
        <ExternalLink size={18} />
        Patient portal
      </a>
    </nav>
  )
}

export default Sidebar
