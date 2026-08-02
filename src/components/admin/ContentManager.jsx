'use client'

import { useEffect, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import { defaultSiteContent, withLinksNavigation } from '@/lib/site-content'

const sectionDetails = {
  home: { label: 'Homepage', description: 'Hero messaging and the main CSA story.' },
  contact: { label: 'Contact page', description: 'Primary email and guidance for contacting CSA.' },
  global: { label: 'Navigation & footer', description: 'Site links, social accounts, and copyright.' },
}

function TextField({ label, value, onChange, multiline = false, help }) {
  const Component = multiline ? 'textarea' : 'input'
  return <label className="block text-sm font-medium">{label}<Component value={value || ''} onChange={(event) => onChange(event.target.value)} rows={multiline ? 4 : undefined} className={`admin-input ${multiline ? 'resize-y leading-6' : ''}`} />{help ? <span className="mt-1 block text-[10px] font-normal text-[#161329]/35">{help}</span> : null}</label>
}

export default function ContentManager() {
  const [content, setContent] = useState(defaultSiteContent)
  const [section, setSection] = useState('home')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error)
        setContent({
          ...payload.content,
          global: { ...payload.content.global, navItems: withLinksNavigation(payload.content.global?.navItems) },
        })
      })
      .catch((loadError) => setError(loadError.message || 'Unable to load content.'))
      .finally(() => setLoading(false))
  }, [])

  function update(key, value) {
    setContent((current) => ({ ...current, [section]: { ...current[section], [key]: value } }))
  }

  function updateNested(key, nestedKey, value) {
    update(key, { ...content[section][key], [nestedKey]: value })
  }

  async function save() {
    setSaving(true); setMessage(''); setError('')
    try {
      const response = await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section, data: content[section] }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save content.')
      setContent((current) => ({ ...current, [section]: { ...current[section], ...payload.content } }))
      setMessage(`${sectionDetails[section].label} saved.`)
    } catch (saveError) { setError(saveError.message) } finally { setSaving(false) }
  }

  if (loading) return <p className="py-24 text-center text-sm text-[#161329]/40">Loading website content…</p>

  const home = content.home
  const contact = content.contact
  const global = content.global

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <AdminPageHeader eyebrow="COPY & LINKS" title="Website content" description="Update the words and links visitors see without opening a code file." actions={<button onClick={save} disabled={saving} className="rounded-xl bg-[#161329] px-6 py-3 text-sm font-medium text-white hover:bg-[#25487D] disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>} />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[250px_1fr]">
        <nav className="rounded-2xl border border-[#161329]/8 bg-white p-2 shadow-sm lg:sticky lg:top-8">{Object.entries(sectionDetails).map(([key, details]) => <button key={key} onClick={() => { setSection(key); setMessage(''); setError('') }} className={`w-full rounded-xl px-4 py-3 text-left ${section === key ? 'bg-[#161329] text-white' : 'hover:bg-[#F4F2ED]'}`}><span className="block text-sm font-medium">{details.label}</span><span className={`mt-1 block text-[10px] leading-4 ${section === key ? 'text-white/45' : 'text-[#161329]/40'}`}>{details.description}</span></button>)}</nav>
        <section className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-7"><h2 className="font-josefin text-2xl font-semibold">{sectionDetails[section].label}</h2><p className="mt-1 text-sm text-[#161329]/45">{sectionDetails[section].description}</p></div>
          {message ? <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {section === 'home' ? <div className="grid gap-5 sm:grid-cols-2"><TextField label="Hero eyebrow" value={home.heroEyebrow} onChange={(v) => update('heroEyebrow', v)} /><TextField label="Hero tagline" value={home.heroTagline} onChange={(v) => update('heroTagline', v)} /><TextField label="Hero line 1" value={home.heroLineOne} onChange={(v) => update('heroLineOne', v)} /><TextField label="Hero line 2" value={home.heroLineTwo} onChange={(v) => update('heroLineTwo', v)} /><TextField label="Hero line 3" value={home.heroLineThree} onChange={(v) => update('heroLineThree', v)} /><TextField label="Description heading" value={home.descriptionTitle} onChange={(v) => update('descriptionTitle', v)} /><div className="sm:col-span-2"><TextField label="CSA description" multiline value={home.description} onChange={(v) => update('description', v)} /></div><TextField label="Our goal" multiline value={home.ourGoal} onChange={(v) => update('ourGoal', v)} /><TextField label="What we offer" multiline value={home.weOffer} onChange={(v) => update('weOffer', v)} /><TextField label="Our values" multiline value={home.values} onChange={(v) => update('values', v)} /><TextField label="Join us" multiline value={home.joinUs} onChange={(v) => update('joinUs', v)} /></div> : null}
          {section === 'contact' ? <div className="grid gap-5 sm:grid-cols-2"><TextField label="Page heading" value={contact.heading} onChange={(v) => update('heading', v)} /><TextField label="Contact email" value={contact.emailAddress} onChange={(v) => update('emailAddress', v)} help="This address becomes the Email Us link on the page." /><div className="sm:col-span-2"><TextField label="Introductory text" multiline value={contact.introText} onChange={(v) => update('introText', v)} /></div><TextField label="Email guidance" multiline value={contact.emailDescription} onChange={(v) => update('emailDescription', v)} /><TextField label="Instagram guidance" multiline value={contact.instagramDescription} onChange={(v) => update('instagramDescription', v)} /><p className="sm:col-span-2 rounded-xl bg-[#F4F2ED] px-4 py-3 text-xs leading-5 text-[#161329]/55">The Instagram destination and other social links are managed under <button type="button" onClick={() => { setSection('global'); setMessage(''); setError('') }} className="font-medium text-[#25487D] underline underline-offset-2">Navigation &amp; footer</button>.</p></div> : null}
          {section === 'global' ? <div className="space-y-7"><div><h3 className="font-josefin text-lg font-semibold">Navigation</h3><div className="mt-3 space-y-2">{global.navItems.map((item, index) => <div key={index} className="grid grid-cols-[1fr_1fr] gap-2"><input value={item.text} onChange={(e) => update('navItems', global.navItems.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry))} className="admin-input mt-0" /><input value={item.href} onChange={(e) => update('navItems', global.navItems.map((entry, i) => i === index ? { ...entry, href: e.target.value } : entry))} className="admin-input mt-0" /></div>)}</div></div><div className="grid gap-5 sm:grid-cols-2">{Object.keys(global.socialLinks).map((network) => <TextField key={network} label={`${network[0].toUpperCase()}${network.slice(1)} URL`} value={global.socialLinks[network]} onChange={(v) => updateNested('socialLinks', network, v)} />)}<div className="sm:col-span-2"><TextField label="Footer copyright" value={global.footerCopyright} onChange={(v) => update('footerCopyright', v)} /></div></div></div> : null}
        </section>
      </div>
    </main>
  )
}
