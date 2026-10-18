import { useState } from 'react'
import type { FormEvent } from 'react'
import { createDoctor } from '../api'
import type { Doctor } from '../types'

interface NewDoctorFormProps {
    onCreated: (doctor: Doctor) => void
}

function NewDoctorForm({ onCreated }: NewDoctorFormProps) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [error, setError] = useState<string | null>(null)



    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        try {
            const doctor = await createDoctor({
                first_name: firstName,
                last_name: lastName,
                specialty: specialty
            })
            onCreated(doctor)
            setFirstName('')
            setLastName('')
            setSpecialty('')
        } catch (err) {
            setError((err as Error).message)
        }

    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>New doctor</h2>

            <label>
                First name
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label>
                Last name
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>

            <label>
                Specialty
                <input
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                />
            </label>




            {error && <p className="form-error">{error}</p>}

            <button type="submit">Add doctor</button>
        </form>
    )
}

export default NewDoctorForm
