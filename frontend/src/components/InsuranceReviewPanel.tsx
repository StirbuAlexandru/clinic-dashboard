import { FileText } from 'lucide-react'
import { insuranceCardUrl } from '../api'
import { personName } from '../format'
import type { Patient } from '../types'

interface InsuranceReviewPanelProps {
  patients: Patient[]
  onReview: (patientId: number, decision: 'approved' | 'rejected') => void
}

// Cards uploaded from the patient portal that nobody has checked yet
function InsuranceReviewPanel({ patients, onReview }: InsuranceReviewPanelProps) {
  const pending = patients.filter((patient) => patient.insurance_review === 'pending')

  return (
    <div className="panel">
      <h2 className="panel-title">Insurance cards to review</h2>
      <p className="panel-subtitle">
        Uploaded by patients when booking. Check that the name and member ID match the card.
        Approving marks their unbilled visits as insured.
      </p>

      {pending.length === 0 && <p className="empty-state">No cards waiting for review.</p>}

      <div className="review-grid">
        {pending.map((patient) => {
          const cardUrl = insuranceCardUrl(patient.id)
          const isPdf = patient.insurance_card_filename?.endsWith('.pdf')

          return (
            <article key={patient.id} className="review-card">
              <a href={cardUrl} target="_blank" rel="noreferrer" className="review-preview">
                {isPdf ? (
                  <span className="review-pdf">
                    <FileText size={32} />
                    Open PDF
                  </span>
                ) : (
                  <img src={cardUrl} alt={`Insurance card of ${personName(patient)}`} />
                )}
              </a>

              <div className="review-details">
                <strong>{personName(patient)}</strong>
                <span>Born {patient.date_of_birth}</span>
                <span>
                  {patient.insurance_provider} · {patient.insurance_member_id}
                </span>
              </div>

              <div className="review-actions">
                <button onClick={() => onReview(patient.id, 'approved')}>Approve</button>
                <button className="button-danger" onClick={() => onReview(patient.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default InsuranceReviewPanel
