'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const DRAFT_KEY = 'greetisizer_draft'

type GenerationPhase = 'preparing' | 'ready'

export default function GeneratingPage() {
  const router = useRouter()
  const supabase = createClient()
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [phase, setPhase] = useState<GenerationPhase>('preparing')
  const [selectedVersionLabel, setSelectedVersionLabel] = useState('')
  const [selectedMessage, setSelectedMessage] = useState('')
  const [occasion, setOccasion] = useState('')
  const [vibe, setVibe] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadPage() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !data.session) {
        router.replace('/login')
        return
      }

      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY)

        if (!savedDraft) {
          router.replace('/versions')
          return
        }

        const parsed = JSON.parse(savedDraft)

        if (!parsed?.selectedVersionId) {
          router.replace('/versions')
          return
        }

        setSelectedVersionLabel(parsed.selectedVersionLabel || 'Selected Version')
        setSelectedMessage(parsed.selectedMessage || '')
        setOccasion(parsed.occasion || '')
        setVibe(parsed.vibe || '')
      } catch {
        router.replace('/versions')
        return
      }

      setCheckingAuth(false)

      readyTimerRef.current = setTimeout(() => {
        if (!mounted) return
        setPhase('ready')
      }, 2800)
    }

    loadPage()

    return () => {
      mounted = false
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current)
      }
    }
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    router.push('/versions')
  }

  function handlePrimaryAction() {
    if (phase !== 'ready') return
    router.push('/preview')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening your generating screen…</p>
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

              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/88">
                GREETISIZER
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#b31252] shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
              >
                Logout
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <section className="pt-2 text-center">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/80">
                  Generating
                </p>

                <h1 className="text-[34px] font-black leading-[0.94] tracking-[-0.04em] text-white">
                  Creating your
                  <br />
                  greeting card
                </h1>

                <p className="mx-auto mt-3 max-w-[290px] text-[13px] font-medium leading-[1.25] text-white/82">
                  We are preparing your preview from the message you selected.
                </p>
              </section>

              <section className="pt-5">
                <div className="rounded-[28px] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[15px] font-black text-[#7d1542]">
                      {selectedVersionLabel || 'Selected Version'}
                    </p>

                    <div className="shrink-0 rounded-full bg-[#f9d7e6] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#b31252]">
                      {phase === 'ready' ? 'Image ready' : 'AI working'}
                    </div>
                  </div>

                  <div className="mb-4 rounded-[22px] bg-[#fff5f9] p-4">
                    <p
                      className="text-[13px] leading-[1.4] text-[#7d1542]"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {selectedMessage || 'Your selected message will appear here.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a85f82]">
                          Occasion
                        </span>
                        <span className="text-[12px] font-semibold text-[#7d1542]">
                          {occasion || '—'}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#f4d4e2]">
                        <div
                          className={`h-2.5 rounded-full ${
                            phase === 'ready'
                              ? 'w-full bg-[#c2185b]'
                              : 'w-[88%] animate-pulse bg-[#c2185b]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a85f82]">
                          Vibe
                        </span>
                        <span className="text-[12px] font-semibold text-[#7d1542]">
                          {vibe || '—'}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#f4d4e2]">
                        <div
                          className={`h-2.5 rounded-full ${
                            phase === 'ready'
                              ? 'w-full bg-[#cf2f70]'
                              : 'w-[78%] animate-pulse bg-[#cf2f70]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a85f82]">
                          Layout
                        </span>
                        <span className="text-[12px] font-semibold text-[#7d1542]">
                          {phase === 'ready' ? 'Complete' : 'In progress'}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#f4d4e2]">
                        <div
                          className={`h-2.5 rounded-full ${
                            phase === 'ready'
                              ? 'w-full bg-[#df4a89]'
                              : 'w-[70%] animate-pulse bg-[#df4a89]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-4">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={phase !== 'ready'}
                  className={`flex min-h-[54px] w-full items-center justify-center rounded-full px-6 py-4 text-[16px] font-black shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition ${
                    phase === 'ready'
                      ? 'bg-[#ff1e3c] text-white'
                      : 'bg-white text-[#1f0b14]'
                  }`}
                >
                  {phase === 'ready' ? 'READY!' : 'Preparing...'}
                </button>
              </section>

              <div className="flex-1" />

              <section className="pt-4">
                <div className="rounded-[18px] border border-dashed border-white/70 bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                    Ad placeholder
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}