'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const OCCASION_SUGGESTIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Congratulations',
  'Thank You',
  'Get Well Soon',
  'Baby Shower',
  'Farewell',
  'Retirement',
  'Housewarming',
  'Friendship',
  'Love',
  'Mother’s Day',
  'Father’s Day',
  'Valentine’s Day',
  'New Year',
  'Christmas',
  'Easter',
  'Eid',
  'Diwali',
  'Holi',
  'Raksha Bandhan',
  'Ganesh Chaturthi',
  'Gudi Padwa',
]

const QUICK_CHIPS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Congratulations',
  'Thank You',
  'Get Well Soon',
  'Diwali',
  'Gudi Padwa',
]

export default function OccasionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [occasion, setOccasion] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    function clearOccasionField() {
      if (!mounted) return

      setOccasion('')
      setShowDropdown(false)

      try {
        const savedDraft = localStorage.getItem('greetisizer_draft')
        if (!savedDraft) return

        const parsed = JSON.parse(savedDraft)
        if (parsed && typeof parsed === 'object') {
          delete parsed.occasion
          localStorage.setItem('greetisizer_draft', JSON.stringify(parsed))
        }
      } catch {
        // ignore localStorage issues
      }
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !data.session) {
        router.replace('/login')
        return
      }

      clearOccasionField()
      setCheckingAuth(false)
    }

    function handlePageShow() {
      clearOccasionField()
    }

    loadSession()
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      mounted = false
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [router, supabase])

  const filteredSuggestions = useMemo(() => {
    const value = occasion.trim().toLowerCase()

    if (!value) {
      return OCCASION_SUGGESTIONS.slice(0, 8)
    }

    return OCCASION_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(value)
    ).slice(0, 8)
  }, [occasion])

  function saveOccasionToDraft(value: string) {
    try {
      const existingDraft = localStorage.getItem('greetisizer_draft')
      const parsed = existingDraft ? JSON.parse(existingDraft) : {}

      localStorage.setItem(
        'greetisizer_draft',
        JSON.stringify({
          ...parsed,
          occasion: value,
        })
      )
    } catch {
      localStorage.setItem(
        'greetisizer_draft',
        JSON.stringify({ occasion: value })
      )
    }
  }

  function handleSelectSuggestion(value: string) {
    setOccasion(value)
    setShowDropdown(false)
  }

  async function handleContinue(e?: FormEvent) {
    e?.preventDefault()

    const cleaned = occasion.trim()
    if (!cleaned) return

    setIsSubmitting(true)
    saveOccasionToDraft(cleaned)
    router.push('/vibe')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    setOccasion('')
    router.push('/')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="text-center px-6">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening your occasion screen…</p>
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
                  Occasion
                </p>

                <h1 className="text-[40px] font-black leading-[0.92] tracking-[-0.04em] text-white">
                  <span className="block">I want to create</span>
                  <span className="block">a greeting card for</span>
                </h1>
              </section>

              <section className="mb-6">
                <div className="relative mb-5">
                  <div className="rounded-[26px] bg-white p-[2px] shadow-[0_14px_30px_rgba(0,0,0,0.14)]">
                    <div className="rounded-[24px] bg-white px-5 py-4">
                      <input
                        type="text"
                        value={occasion}
                        onChange={(e) => {
                          setOccasion(e.target.value)
                          setShowDropdown(true)
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowDropdown(false), 120)
                        }}
                        placeholder="Write your own occasion or pick one below"
                        aria-label="Occasion"
                        autoComplete="off"
                        className="w-full bg-transparent text-[16px] font-semibold text-[#7d1542] outline-none placeholder:text-[12px] placeholder:font-medium placeholder:text-[#a85f82]"
                      />
                    </div>
                  </div>

                  {showDropdown && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-[24px] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                      {filteredSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center justify-between border-b border-[#f2d6e3] px-5 py-3.5 text-left text-[14px] font-medium text-[#7d1542] last:border-b-0"
                        >
                          <span>{item}</span>
                          <span className="text-[#c05b8f]">↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/80">
                  Quick picks
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSelectSuggestion(chip)}
                      className="rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-[#7d1542] shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <button
                  type="submit"
                  disabled={!occasion.trim() || isSubmitting}
                  className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[16px] font-black text-[#1f0b14] shadow-[0_14px_30px_rgba(0,0,0,0.18)] disabled:bg-white disabled:text-[#1f0b14] disabled:opacity-100"
                >
                  {isSubmitting ? 'Continuing…' : 'Continue'}
                </button>
              </section>

              <div className="flex-1" />

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