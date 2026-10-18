// Small helpers for showing money, dates and names the same way everywhere

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatDate(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// "Jun 3, 2026, 10:00 AM"
export function formatDateTime(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isInTheFuture(isoDateTime: string) {
  return new Date(isoDateTime) > new Date()
}

export function formatTime(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function personName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`
}

// "2026-10-18T15:04:05": local time without a timezone, the format the API stores
export function localDateTimeNow() {
  return new Date().toLocaleString('sv-SE').replace(' ', 'T')
}

// "2026-10-18": today's date in the format of <input type="date">
export function todayString() {
  return new Date().toLocaleDateString('sv-SE')
}
