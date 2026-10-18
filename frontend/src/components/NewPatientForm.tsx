import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPatient } from '../api'
import type { Patient } from '../types'

interface NewPatientFormProps {
    onCreated: (patient: Patient) => void
}

function NewPatientForm({ onCreated }: NewPatientFormProps) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [phone, setPhone] = useState('')
    const [selfPay, setSelfPay] = useState(false)
    const [insuranceProvider, setInsuranceProvider] = useState('')
    const [memberId, setMemberId] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        try {
            const patient = await createPatient({
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
                phone: phone || null,
                insurance_provider: selfPay ? null : insuranceProvider,
                insurance_member_id: selfPay ? null : memberId,
            })
            onCreated(patient)
            setFirstName('')
            setLastName('')
            setDateOfBirth('')
            setPhone('')
            setSelfPay(false)
            setInsuranceProvider('')
            setMemberId('')
        } catch (err) {
            setError((err as Error).message)
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>New patient</h2>

            <label>
                First name
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label>
                Last name
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
            <label>
                Date of birth
                <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                />
            </label>
            <label>
                Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>

            <label className="checkbox-label">
                <input type="checkbox" checked={selfPay} onChange={(e) => setSelfPay(e.target.checked)} />
                Self-pay (no insurance)
            </label>

            {!selfPay && (
                <>
                    <label>
                        Insurance provider
                        <input
                            value={insuranceProvider}
                            onChange={(e) => setInsuranceProvider(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Insurance member ID
                        <input
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            placeholder="From the insurance card"
                            required
                        />
                    </label>
                </>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit">Add patient</button>
        </form>
    )
}

export default NewPatientForm
