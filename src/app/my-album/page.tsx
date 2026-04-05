'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const ALBUM_KEY = 'greetisizer_album'
const MAX_ALBUM_ITEMS = 10
const MAX_ALBUM_DAYS = 10
const MAX_ALBUM_AGE_MS = MAX_ALBUM_DAYS * 24 * 60 * 60 * 1000

type AlbumItem = {
  id: string
  imageUrl: string
  label?: string
  message?: string
  occasion?: string
  vibe?: string
  createdAt?: string
}

function sanitizeAlbum(raw: unknown): AlbumItem[] {
  if (!Array.isArray(raw)) return []

  const now = Date.now()

  return raw
    .filter((item): item is AlbumItem => {
      if (!item || typeof item !== 'object') return false

      const maybeItem = item as AlbumItem

      return (
        typeof maybeItem.id === 'string' &&
        typeof maybeItem.imageUrl === 'string' &&
        maybeItem.imageUrl.length > 0
      )
    })
    .filter((item) => {
      if (!item.createdAt) return true

      const createdAtMs = new Date(item.createdAt).getTime()
      if (Number.isNaN(createdAtMs)) return true

      return now - createdAtMs <= MAX_ALBUM_AGE_MS
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, MAX_ALBUM_ITEMS)
}

export default function MyAlbumPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

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
        const rawAlbum = localStorage.getItem(ALBUM_KEY)
        const parsedAlbum = rawAlbum ? JSON.parse(rawAlbum) : []
        const cleanedAlbum = sanitizeAlbum(parsedAlbum)

        localStorage.setItem(ALBUM_KEY, JSON.stringify(cleanedAlbum))

        if (!mounted) return

        setAlbumItems(cleanedAlbum)
        setCurrentIndex(0)
      } catch {
        localStorage.setItem(ALBUM_KEY, JSON.stringify([]))
        if (!mounted) return
        setAlbumItems([])
        setCurrentIndex(0)
      }

      if (mounted) {
        setCheckingAuth(false)
      }
    }

    loadPage()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  const currentItem = useMemo(() => {
    if (albumItems.length === 0) return null
    return albumItems[Math.min(currentIndex, albumItems.length - 1)] ?? null
  }, [albumItems, currentIndex])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    router.push('/')
  }

  function persistAlbum(nextItems: AlbumItem[]) {
    setAlbumItems(nextItems)
    localStorage.setItem(ALBUM_KEY, JSON.stringify(nextItems))
  }

  function handlePrevious() {
    if (albumItems.length <= 1) return
    setCurrentIndex((prev) => (prev === 0 ? albumItems.length - 1 : prev - 1))
    setStatusMessage('')
  }

  function handleNext() {
    if (albumItems.length <= 1) return
    setCurrentIndex((prev) => (prev === albumItems.length - 1 ? 0 : prev + 1))
    setStatusMessage('')
  }

  function handleDeleteCurrent() {
    if (!currentItem || isBusy) return

    setIsBusy(true)

    const nextItems = albumItems.filter((item) => item.id !== currentItem.id)
    persistAlbum(nextItems)

    setCurrentIndex((prev) => {
      if (nextItems.length === 0) return 0
      return Math.min(prev, nextItems.length - 1)
    })

    setStatusMessage('Deleted from My Album.')
    setIsBusy(false)
  }

  function handleCreateNew() {
    router.push('/occasion')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening My Album…</p>
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
          <div className="flex h-full flex-col px-4 pb-4 pt-4">
            <div className="mb-3 flex items-center justify-between">
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

            <section className="mb-3 rounded-[20px] bg-white/18 px-4 py-3 text-center backdrop-blur-sm">
              <h1 className="text-[24px] font-black leading-none text-white">
                My Album
              </h1>
              <p className="mt-2 text-[11px] font-medium leading-[1.3] text-white/88">
                Maximum {MAX_ALBUM_ITEMS} images are stored here for up to {MAX_ALBUM_DAYS} days.
              </p>
            </section>

            <section className="mb-3 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={albumItems.length <= 1 || isBusy}
                className="rounded-full bg-white px-3 py-3 text-[14px] font-black text-[#b31252] shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-60"
              >
                Prev
              </button>

              <div className="flex items-center justify-center rounded-full bg-white px-3 py-3 text-[13px] font-black text-[#7d1542] shadow-[0_12px_24px_rgba(0,0,0,0.14)]">
                {albumItems.length === 0 ? '0 / 0' : `${currentIndex + 1} / ${albumItems.length}`}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={albumItems.length <= 1 || isBusy}
                className="rounded-full bg-white px-3 py-3 text-[14px] font-black text-[#b31252] shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-60"
              >
                Next
              </button>
            </section>

            <section className="flex min-h-0 flex-1 items-start justify-center pt-1 pb-2">
              <div className="mx-auto w-full max-w-[332px]">
                <div className="aspect-[9/16] w-full overflow-hidden rounded-[22px] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                  {currentItem ? (
                    <img
                      src={currentItem.imageUrl}
                      alt="Saved greeting card"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <p className="text-[18px] font-black text-[#b31252]">
                        No saved cards yet
                      </p>
                      <p className="mt-2 text-[13px] leading-[1.4] text-[#7d1542]">
                        Save a greeting card from the Preview page and it will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDeleteCurrent}
                disabled={!currentItem || isBusy}
                className="rounded-full bg-white px-4 py-3.5 text-[15px] font-black text-black shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-60"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isBusy}
                className="rounded-full bg-white px-4 py-3.5 text-[15px] font-black text-[#b31252] shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-60"
              >
                Create New
              </button>
            </section>

            <div className="h-5 flex items-center justify-center">
              {statusMessage ? (
                <p className="text-center text-[11px] font-medium text-white/88">
                  {statusMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}