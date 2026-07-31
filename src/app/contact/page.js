'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { useSiteContent } from '@/components/general/SiteContentProvider'
import { db } from '@/lib/firebase'

const socialNetworks = [
  { key: 'linkedin', label: 'LinkedIn', icon: '/icons/socials/linkedin.png' },
  { key: 'tiktok', label: 'TikTok', icon: '/icons/socials/tik-tok.png' },
  { key: 'discord', label: 'Discord', icon: '/icons/socials/discord.png' },
]

const defaultContactImages = {
  primary: { imageUrl: '/images/csa-candid.jpg', imageAlt: 'TMUCSA team members together' },
  secondary: { imageUrl: '/images/orientation-2023.jpg', imageAlt: 'Students at a TMUCSA event' },
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

function Arrow({ diagonal = false }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={diagonal ? 'M7 17L17 7M8 7h9v9' : 'M5 12h14m-5-5 5 5-5 5'} />
    </svg>
  )
}

export default function Contact() {
  const content = useSiteContent('contact')
  const global = useSiteContent('global')
  const [contactImages, setContactImages] = useState(defaultContactImages)
  const headingParts = content.heading.trim().split(/\s+/)
  const headingLast = headingParts.pop()

  useEffect(() => {
    let active = true
    getDocs(collection(db, 'contact-images'))
      .then((snapshot) => {
        if (!active || snapshot.empty) return
        const next = { ...defaultContactImages }
        snapshot.docs.forEach((document) => {
          if (next[document.id]) next[document.id] = document.data()
        })
        setContactImages(next)
      })
      .catch((error) => console.error('Unable to load contact page images:', error))
    return () => { active = false }
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-default text-white">
      <div className="pointer-events-none absolute left-[-12rem] top-24 h-[32rem] w-[32rem] rounded-full bg-navy/20 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-10rem] top-[34rem] h-[28rem] w-[28rem] rounded-full bg-beige/5 blur-[110px]" aria-hidden="true" />

      <section className="relative mx-auto grid max-w-[1440px] gap-14 px-6 pb-20 pt-28 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-16 lg:pb-28 lg:pt-36 xl:px-24">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
          className="relative z-10"
        >
          <motion.div variants={reveal} transition={{ duration: 0.6 }} className="mb-8 flex items-center gap-4 font-jost text-[11px] tracking-[0.28em] text-white/55 sm:text-xs">
            <span>CONTACT</span>
            <span className="h-px w-16 bg-beige/70" />
            <span>TMUCSA</span>
          </motion.div>

          <motion.h1 variants={reveal} transition={{ duration: 0.7 }} className="font-josefin text-[clamp(3.6rem,8vw,7.5rem)] font-bold uppercase leading-[0.84] tracking-[-0.045em]">
            <span className="block">{headingParts.join(' ')}</span>
            <span className="block text-beige">{headingLast}</span>
          </motion.h1>

          <motion.div variants={reveal} transition={{ duration: 0.7 }} className="mt-9 flex max-w-xl gap-5 sm:mt-12">
            <span className="mt-1 block h-20 w-[3px] shrink-0 bg-beige" aria-hidden="true" />
            <p className="font-jost text-lg font-light leading-8 text-white/75 sm:text-xl">{content.introText}</p>
          </motion.div>

          <motion.div variants={reveal} transition={{ duration: 0.7 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={`mailto:${content.emailAddress}`} className="group inline-flex items-center justify-between gap-8 bg-beige px-6 py-4 font-jost text-sm font-medium text-default transition hover:bg-white sm:min-w-52">
              Email us
              <span className="transition-transform group-hover:translate-x-1"><Arrow /></span>
            </a>
            <Link href={global.socialLinks.instagram} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between gap-8 border border-white/25 px-6 py-4 font-jost text-sm font-medium text-white transition hover:border-beige hover:text-beige sm:min-w-52">
              Instagram DM
              <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><Arrow diagonal /></span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }} className="relative mx-auto w-full max-w-2xl pb-10 pl-5 sm:pb-16 sm:pl-12 lg:mx-0">
          <div className="absolute right-0 top-0 h-[82%] w-[88%] border border-beige/25" aria-hidden="true" />
          <div className="relative mt-5 aspect-[4/5] w-[92%] overflow-hidden sm:mt-9 sm:aspect-[5/6]">
            {contactImages.primary?.imageUrl ? <Image src={contactImages.primary.imageUrl} alt={contactImages.primary.imageAlt || 'TMUCSA team members together'} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover object-[58%_center]" /> : <div className="absolute inset-0 bg-white/5" aria-hidden="true" />}
            <div className="absolute inset-0 bg-gradient-to-t from-default/65 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 right-0 w-[54%] border-[6px] border-default bg-default sm:border-[10px]">
            <div className="relative aspect-[4/3] overflow-hidden">
              {contactImages.secondary?.imageUrl ? <Image src={contactImages.secondary.imageUrl} alt={contactImages.secondary.imageAlt || 'Students at a TMUCSA event'} fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-cover" /> : <div className="absolute inset-0 bg-white/5" aria-hidden="true" />}
            </div>
          </div>

          <div className="absolute bottom-5 left-0 hidden -rotate-90 origin-bottom-left font-jost text-[10px] tracking-[0.3em] text-white/45 sm:block" aria-hidden="true">
            CULTURE · COMMUNITY · CONNECTION
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-white/10 bg-[#0E0C24]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 lg:px-16 lg:py-28 xl:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} transition={{ staggerChildren: 0.12 }}>
            <motion.div variants={reveal} transition={{ duration: 0.6 }} className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end lg:mb-16">
              <div>
                <h2 className="font-josefin text-4xl font-semibold tracking-tight sm:text-5xl">CHOOSE A CHANNEL</h2>
              </div>
            </motion.div>

            <div className="grid border-t border-white/15 lg:grid-cols-2">
              <motion.a variants={reveal} transition={{ duration: 0.65 }} href={`mailto:${content.emailAddress}`} className="group border-b border-white/15 py-9 transition-colors hover:bg-white/[0.025] lg:border-r lg:px-8 lg:first:pl-0">
                <div className="flex items-start justify-between gap-6">
                  <span className="font-jost text-xs tracking-[0.25em] text-beige/55">01 / EMAIL</span>
                  <span className="text-beige transition-transform group-hover:translate-x-1"><Arrow /></span>
                </div>
                <h3 className="mt-10 break-all font-josefin text-2xl font-semibold sm:text-3xl">{content.emailAddress}</h3>
                <p className="mt-4 max-w-lg font-jost font-light leading-7 text-white/55">{content.emailDescription}</p>
              </motion.a>

              <motion.div variants={reveal} transition={{ duration: 0.65 }} className="group border-b border-white/15 py-9 transition-colors hover:bg-white/[0.025] lg:px-8 lg:last:pr-0">
                <Link href={global.socialLinks.instagram} target="_blank" rel="noreferrer" className="block">
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-jost text-xs tracking-[0.25em] text-beige/55">02 / INSTAGRAM</span>
                    <span className="text-beige transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><Arrow diagonal /></span>
                  </div>
                  <h3 className="mt-10 font-josefin text-3xl font-semibold">@tmucsa</h3>
                  <p className="mt-4 max-w-lg font-jost font-light leading-7 text-white/55">{content.instagramDescription}</p>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-beige text-default">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-7 px-6 py-9 sm:px-10 md:flex-row md:items-center lg:px-16 xl:px-24">
          <div>
            <p className="font-josefin text-xl font-semibold">KEEP UP WITH CSA</p>
            <p className="mt-1 font-jost text-sm text-default/55">Events, announcements, and community updates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialNetworks.map((network) => (
              <Link key={network.key} href={global.socialLinks[network.key]} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-3 border border-default/20 px-4 py-3 font-jost text-xs font-medium uppercase tracking-wider transition hover:border-default hover:bg-default hover:text-white">
                <Image src={network.icon} width={18} height={18} alt="" className="brightness-0 transition group-hover:invert" />
                {network.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
