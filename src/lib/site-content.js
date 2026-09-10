// Field definitions only. Editable values come exclusively from Firestore.
export const siteContentSchema = {
  global: {
    navItems: 'navigation',
    socialLinks: { linkedin: 'string', instagram: 'string', tiktok: 'string', discord: 'string' },
    footerCopyright: 'string',
  },
  home: {
    heroEyebrow: 'string', heroLineOne: 'string', heroLineTwo: 'string',
    heroLineThree: 'string', heroTagline: 'string', descriptionTitle: 'string',
    description: 'string', ourGoal: 'string', weOffer: 'string', values: 'string', joinUs: 'string',
  },
  contact: {
    heading: 'string', introText: 'string', emailAddress: 'string',
    emailDescription: 'string', instagramDescription: 'string',
  },
}

export function validateContent(data, schema, path = 'content') {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Missing or invalid ${path}`)
  for (const [key, type] of Object.entries(schema)) {
    const value = data[key]
    if (typeof type === 'object') validateContent(value, type, `${path}.${key}`)
    else if (type === 'navigation') {
      if (!Array.isArray(value)) throw new Error(`Missing or invalid ${path}.${key}`)
      value.forEach((item, index) => validateContent(item, { href: 'string', text: 'string' }, `${path}.${key}[${index}]`))
    } else if (typeof value !== type) throw new Error(`Missing or invalid ${path}.${key}`)
  }
  return data
}
