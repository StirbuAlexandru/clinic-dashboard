import { useState } from 'react'
import type { FormEvent } from 'react'
import { createAppointment } from '../api'
import type { Appointment, Doctor, Patient } from '../types'


interface NewAppointmentFormProps {
    patients: Patient[]
    doctors: Doctor[]
    onCreated: (appointment: Appointment) => void
}

function NewAppointmentForm({ patients, doctors, onCreated }: NewAppointmentFormProps) {
    const [patientId, setPatientId] = useState('')
    const [doctorId, setDoctorId] = useState('')
    const [startTime, setStartTime] = useState('')
    const [price, setPrice] = useState('')
    const [reason, setReason] = useState('')
    const [error, setError] = useState<string | null>(null)

    // Choosing a doctor fills in their usual price (it can still be changed)
    function handleDoctorChange(id: string) {
        setDoctorId(id)
        const doctor = doctors.find((d) => String(d.id) === id)
        if (doctor) {
            setPrice(String(doctor.visit_price_cents / 100))
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        try {
            const appointment = await createAppointment({
                patient_id: Number(patientId),
                doctor_id: Number(doctorId),
                start_time: startTime,
                reason: reason || null,
                price_cents: Math.round(Number(price) * 100),
            })
            onCreated(appointment)
            setReason('')
            setPrice('')
        } catch (err) {
            setError((err as Error).message)
        }
    }
    return (
        <form className="appointment-form" onSubmit={handleSubmit}>
            <h2>New appointment</h2>

            <label>
                Patient
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Doctor
                <select value={doctorId} onChange={(e) => handleDoctorChange(e.target.value)} required>
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialty})
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Date and time
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                />
            </label>

            <label>
                Price ($)
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </label>

            <label>
                Reason
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit">Create appointment</button>
        </form>

    )
}
export default NewAppointmentForm
