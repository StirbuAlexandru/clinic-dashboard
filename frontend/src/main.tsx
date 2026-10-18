import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import PatientPortal from './pages/PatientPortal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public website where patients book appointments */}
        <Route path="/" element={<PatientPortal />} />
        {/* Clinic staff dashboard */}
        <Route path="/admin/*" element={<App />} />
        {/* Any other address: back to the patient portal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
