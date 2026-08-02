const torontoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function analyticsDateKey(date = new Date()) {
  const parts = Object.fromEntries(torontoDateFormatter.formatToParts(date).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function analyticsPageKey(pathname) {
  const path = String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/'
  const known = {
    '/': 'home',
    '/events': 'events',
    '/team': 'team',
    '/contact': 'contact',
    '/links': 'links',
    '/team-member-form': 'team-member-form',
  }
  return known[path] || null
}
