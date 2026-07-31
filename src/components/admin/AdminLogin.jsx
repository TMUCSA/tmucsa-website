'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AdminLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn() {
    setLoading(true)
    setError('')

    try {
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const idToken = await result.user.getIdToken()
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const payload = await response.json()

      if (!response.ok) {
        await signOut(auth)
        throw new Error(payload.error || 'This account does not have access.')
      }

      // The server session is now authoritative; no Firebase browser session is
      // needed for privileged writes.
      await signOut(auth)
      router.push('/admin/dashboard')
      router.refresh()
    } catch (signInError) {
      if (signInError?.code !== 'auth/popup-closed-by-user') {
        setError(signInError.message || 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080719] px-6 py-12 font-jost text-white">
      <div className="absolute -left-32 top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#25487D]/30 blur-3xl" />
      <div className="absolute -right-32 bottom-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[#B9A17A]/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">
          <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-[#25487D]/70 via-[#171630] to-[#0A081B] p-12 lg:flex">
            <Image src="/icons/logo5.png" alt="TMUCSA" width={72} height={72} className="h-16 w-16" />
            <div>
              <p className="mb-5 font-josefin text-sm tracking-[0.35em] text-[#FFF4E2]/75">TMUCSA CONTENT STUDIO</p>
              <h1 className="max-w-xl font-josefin text-5xl font-semibold leading-[1.05]">
                Keep the community current, without touching the database.
              </h1>
              <p className="mt-6 max-w-lg text-lg font-light leading-8 text-white/65">
                Publish events, organize the team, and update the website from one secure workspace.
              </p>
            </div>
            <p className="text-sm text-white/40">Toronto Metropolitan University Chinese Student Association</p>
          </div>

          <div className="flex min-h-[560px] items-center p-8 sm:p-14 lg:p-16">
            <div className="w-full">
              <Image src="/icons/logo5.png" alt="TMUCSA" width={64} height={64} className="mb-10 h-14 w-14 lg:hidden" />
              <span className="inline-flex rounded-full border border-[#FFF4E2]/20 bg-[#FFF4E2]/10 px-3 py-1 text-xs tracking-[0.2em] text-[#FFF4E2]">
                ADMIN ACCESS
              </span>
              <h2 className="mt-6 font-josefin text-4xl font-semibold">Welcome back</h2>
              <p className="mt-3 max-w-md leading-7 text-white/55">
                Sign in with an approved Google account to manage the TMUCSA website.
              </p>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FFF4E2] px-5 py-4 font-medium text-[#0A081B] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:opacity-60"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
                  <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z" />
                  <path fill="#EA4335" d="M12 5.94c1.47 0 2.78.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
                </svg>
                {loading ? 'Checking access…' : 'Continue with Google'}
              </button>

              {error ? (
                <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <p className="mt-8 text-center text-xs leading-5 text-white/35">
                Access is restricted to accounts approved by TMUCSA.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
