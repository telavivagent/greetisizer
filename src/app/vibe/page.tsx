'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const VIBE_OPTIONS = [
  'Elegant',
  'Romantic',
  'Warm',
  'Cute',
  'Funny',
  'Festive',
  'Minimal',
  'Bold',
]

export default function VibePage() {
  const router = useRouter()
  const supabase = createClient()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [selectedVibe, setSelectedVibe] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !data.session) {
        router.replace('/login')
        return
      }

      try {
        const savedDraft = localStorage.getItem('greetisizer_draft')
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft)
          if (
            parsed &&
            typeof parsed === 'object' &&
            typeof parsed.vibe === 'string'
          ) {
            setSelectedVibe(parsed.vibe)
          }
        }
      } catch {
        // ignore localStorage issues
      }

      setCheckingAuth(false)
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  function saveVibeToDraft(value: string) {
    try {
      const existingDraft = localStorage.getItem('greetisizer_draft')
      const parsed = existingDraft ? JSON.parse(existingDraft) : {}

      localStorage.setItem(
        'greetisizer_draft',
        JSON.stringify({
          ...parsed,
          vibe: value,
        })
      )
    } catch {
      localStorage.setItem(
        'greetisizer_draft',
        JSON.stringify({ vibe: value })
      )
    }
  }

  function handleSelectVibe(value: string) {
    setSelectedVibe(value)
    saveVibeToDraft(value)
  }

  async function handleContinue(e?: FormEvent) {
    e?.preventDefault()

    const cleaned = selectedVibe.trim()
    if (!cleaned) return

    setIsSubmitting(true)
    saveVibeToDraft(cleaned)
    router.push('/message')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    router.push('/occasion')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening your vibe screen…</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full items-center justify-center">
        <div className="flex aspect-[390/844] w-full max-w-[390px] flex-col overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex h-full flex-col px-5 pb-4 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-[#b31252] shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
              >
                ←
              </button>

              <div className="text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-white">
                GREETISIZER
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#b31252] shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
              >
                Logout
              </button>
            </div>

            <form onSubmit={handleContinue} className="flex min-h-0 flex-1 flex-col">
              <section className="mb-4">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/88">
                  Vibe
                </p>

                <h1 className="text-[40px] font-black leading-[0.92] tracking-[-0.04em] text-white">
                  <span className="block">Choose the mood</span>
                  <span className="block">for your card</span>
                </h1>

                <p className="mt-3 text-[14px] font-medium text-white/88">
                  Pick one vibe below
                </p>
              </section>

              <section className="mb-4">
                <div className="flex flex-wrap gap-2.5">
                  {VIBE_OPTIONS.map((vibe) => {
                    const isSelected = selectedVibe === vibe

                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => handleSelectVibe(vibe)}
                        className={`rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${
                          isSelected
                            ? 'bg-[#ffe3ef] text-[#7d1542] ring-2 ring-white/90'
                            : 'bg-white text-[#7d1542]'
                        }`}
                      >
                        {vibe}
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="flex-1" />

              <section className="mb-24">
                <button
                  type="submit"
                  disabled={!selectedVibe.trim() || isSubmitting}
                  className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[16px] font-black text-[#1f0b14] shadow-[0_14px_30px_rgba(0,0,0,0.18)] disabled:bg-white disabled:text-[#1f0b14] disabled:opacity-100"
                >
                  {isSubmitting ? 'Continuing…' : 'Continue'}
                </button>
              </section>

              <section>
                <div className="rounded-[18px] border border-dashed border-white/70 bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                    Ad placeholder
                  </p>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}