'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const DRAFT_KEY = 'greetisizer_draft'

type VersionCard = {
  id: 'original' | 'version1' | 'version2'
  label: string
  text: string
}

export default function VersionsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [originalMessage, setOriginalMessage] = useState('')
  const [version1Message, setVersion1Message] = useState('')
  const [version2Message, setVersion2Message] = useState('')

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

        if (savedDraft) {
          const parsed = JSON.parse(savedDraft)

          if (typeof parsed.message === 'string') {
            setOriginalMessage(parsed.message)
          }

          if (typeof parsed.version1Message === 'string') {
            setVersion1Message(parsed.version1Message)
          }

          if (typeof parsed.version2Message === 'string') {
            setVersion2Message(parsed.version2Message)
          }
        }
      } catch {
        // ignore localStorage issues
      }

      setCheckingAuth(false)
    }

    loadPage()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  const cards = useMemo<VersionCard[]>(
    () => [
      {
        id: 'original',
        label: 'Original',
        text: originalMessage.trim(),
      },
      {
        id: 'version1',
        label: 'Version 1',
        text: version1Message.trim(),
      },
      {
        id: 'version2',
        label: 'Version 2',
        text: version2Message.trim(),
      },
    ],
    [originalMessage, version1Message, version2Message]
  )

  function saveSelectedVersion(card: VersionCard) {
    try {
      const existingDraft = localStorage.getItem(DRAFT_KEY)
      const parsed = existingDraft ? JSON.parse(existingDraft) : {}

      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          ...parsed,
          versions: 3,
          selectedVersionId: card.id,
          selectedVersionLabel: card.label,
          selectedMessage: card.text,
        })
      )
    } catch {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          versions: 3,
          selectedVersionId: card.id,
          selectedVersionLabel: card.label,
          selectedMessage: card.text,
        })
      )
    }
  }

  function handleUseThis(card: VersionCard) {
    saveSelectedVersion(card)
    router.push('/generating')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    router.push('/message')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening your versions screen…</p>
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
              <section className="mb-4 pt-1">
                <h1 className="text-center text-[28px] font-black leading-[1.05] tracking-[-0.03em] text-white">
                  Choose the best message
                </h1>
              </section>

              <section className="flex min-h-0 flex-1 flex-col justify-between">
                {cards.map((card) => (
                  <div key={card.id}>
                    <p className="mb-3 text-[16px] font-extrabold text-white">
                      {card.label}
                    </p>

                    <div className="relative h-[138px] rounded-[28px] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
                      <div className="pr-[126px] text-[13px] leading-[1.35] text-[#7d1542]">
                        {card.text ? (
                          <p
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {card.text}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUseThis(card)}
                        className="absolute bottom-4 right-4 rounded-full bg-[#c10f59] px-6 py-3 text-[15px] font-black text-white shadow-[0_10px_24px_rgba(193,15,89,0.35)]"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </section>

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