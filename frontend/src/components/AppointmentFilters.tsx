import type { Doctor } from '../types'

interface AppointmentFiltersProps {
    doctors: Doctor[]
    billingStatus: string
    doctorId: string
    onBillingStatusChange: (value: string) => void
    onDoctorIdChange: (value: string) => void
}


function AppointmentFilters({
    doctors,
    billingStatus,
    doctorId,
    onBillingStatusChange,
    onDoctorIdChange,
}: AppointmentFiltersProps) {
    return (
        <div className="filters">
            <label>
                Billing status
                <select value={billingStatus} onChange={(e) => onBillingStatusChange(e.target.value)}>
                    <option value="">All</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="submitted">Submitted</option>
                    <option value="paid">Paid</option>
                    <option value="denied">Denied</option>
                </select>
            </label>
            <label>
                Doctor
                <select value={doctorId} onChange={(e) => onDoctorIdChange(e.target.value)} >
                    <option value="">All</option>

                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.first_name} {doctor.last_name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    )
}

export default AppointmentFilters
