'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const DRAFT_KEY = 'greetisizer_draft'
const ALBUM_KEY = 'greetisizer_album'
const MAX_ALBUM_ITEMS = 10

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

async function buildCompositePreview(sourceImageUrl?: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not available')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (sourceImageUrl) {
    try {
      const img = await loadImage(sourceImageUrl)

      const sidePadding = 28
      const topPadding = 28
      const bottomReserved = 150

      const maxWidth = canvas.width - sidePadding * 2
      const maxHeight = canvas.height - topPadding - bottomReserved

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height)
      const drawWidth = img.width * scale
      const drawHeight = img.height * scale

      const x = (canvas.width - drawWidth) / 2
      const y = topPadding + (maxHeight - drawHeight) / 2

      ctx.drawImage(img, x, y, drawWidth, drawHeight)
    } catch {
      // keep plain white card if image cannot be drawn
    }
  }

  ctx.fillStyle = '#8f8f8f'
  ctx.font = '500 30px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('greetisizer.com', canvas.width / 2, canvas.height - 78)

  return canvas.toDataURL('image/png')
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl)
  return response.blob()
}

export default function PreviewPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [selectedVersionLabel, setSelectedVersionLabel] = useState('')
  const [selectedMessage, setSelectedMessage] = useState('')
  const [occasion, setOccasion] = useState('')
  const [vibe, setVibe] = useState('')
  const [rawImageUrl, setRawImageUrl] = useState('')
  const [previewImageUrl, setPreviewImageUrl] = useState('')

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

        const nextRawImageUrl =
          parsed.previewImageUrl ||
          parsed.generatedImageUrl ||
          parsed.finalImageUrl ||
          parsed.imageUrl ||
          ''

        setSelectedVersionLabel(parsed.selectedVersionLabel || 'Selected Version')
        setSelectedMessage(parsed.selectedMessage || '')
        setOccasion(parsed.occasion || '')
        setVibe(parsed.vibe || '')
        setRawImageUrl(nextRawImageUrl)

        const composite = await buildCompositePreview(nextRawImageUrl)
        if (!mounted) return

        setPreviewImageUrl(composite)

        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            ...parsed,
            previewCompositeImageUrl: composite,
          })
        )
      } catch {
        router.replace('/versions')
        return
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

  const hasGeneratedImage = useMemo(() => {
    return Boolean(rawImageUrl)
  }, [rawImageUrl])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleBack() {
    router.push('/generating')
  }

  async function handleDownload() {
    if (!previewImageUrl || isBusy) return

    try {
      setIsBusy(true)

      const blob = await dataUrlToBlob(previewImageUrl)
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `greetisizer-card-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(url), 500)
    } catch {
      alert('Could not download the card.')
    } finally {
      setIsBusy(false)
    }
  }

  function handleDelete() {
    if (isBusy) return

    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      const parsed = savedDraft ? JSON.parse(savedDraft) : {}

      delete parsed.previewImageUrl
      delete parsed.generatedImageUrl
      delete parsed.finalImageUrl
      delete parsed.imageUrl
      delete parsed.previewCardSvg
      delete parsed.previewCompositeImageUrl

      localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed))
    } catch {
      // ignore storage issues
    }

    router.replace('/versions')
  }

  function handleSaveToAlbum() {
    if (!previewImageUrl || isBusy) return

    try {
      const existingAlbumRaw = localStorage.getItem(ALBUM_KEY)
      const existingAlbum = existingAlbumRaw ? JSON.parse(existingAlbumRaw) : []

      const nextItem = {
        id: `${Date.now()}`,
        imageUrl: previewImageUrl,
        label: selectedVersionLabel,
        message: selectedMessage,
        occasion,
        vibe,
        createdAt: new Date().toISOString(),
      }

      const nextAlbum = [nextItem, ...(Array.isArray(existingAlbum) ? existingAlbum : [])].slice(
        0,
        MAX_ALBUM_ITEMS
      )

      localStorage.setItem(ALBUM_KEY, JSON.stringify(nextAlbum))
      alert('Saved to My Album.')
    } catch {
      alert('Could not save to My Album.')
    }
  }

  async function handleShare() {
    if (!previewImageUrl || isBusy) return

    try {
      setIsBusy(true)

      const blob = await dataUrlToBlob(previewImageUrl)
      const file = new File([blob], `greetisizer-card-${Date.now()}.png`, {
        type: 'image/png',
      })

      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean
      }

      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: 'GREETISIZER',
          text: selectedMessage || 'Greeting card created with GREETISIZER',
        })
        return
      }

      if (nav.share) {
        await nav.share({
          title: 'GREETISIZER',
          text: selectedMessage || 'Greeting card created with GREETISIZER',
        })
        return
      }

      alert('Sharing is not supported on this device.')
    } catch {
      // ignore share cancel
    } finally {
      setIsBusy(false)
    }
  }

  function handleMakeAnotherOne() {
    if (isBusy) return

    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore storage issues
    }

    router.push('/occasion')
  }

  if (checkingAuth) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              <p className="text-sm text-white/80">Opening your preview…</p>
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

            <section className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!previewImageUrl || isBusy}
                className="rounded-full bg-white px-4 py-3.5 text-[15px] font-black text-black shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-70"
              >
                Download
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="rounded-full bg-white px-4 py-3.5 text-[15px] font-black text-black shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-70"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={handleSaveToAlbum}
                disabled={!previewImageUrl || isBusy}
                className="rounded-full bg-white px-4 py-3.5 text-[15px] font-black text-black shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-70"
              >
                Save To Album
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={!previewImageUrl || isBusy}
                className="rounded-full bg-[#43a517] px-4 py-3.5 text-[15px] font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.14)] disabled:opacity-70"
              >
                Share
              </button>
            </section>

            <section className="pt-2 text-center">
              <button
                type="button"
                onClick={handleMakeAnotherOne}
                disabled={isBusy}
                className="rounded-full bg-white px-5 py-2.5 text-[14px] font-black text-[#b31252] shadow-[0_10px_22px_rgba(0,0,0,0.14)] disabled:opacity-70"
              >
                Make Another One
              </button>
            </section>

            <section className="flex min-h-0 flex-1 items-start justify-center pt-3 pb-3">
              <div className="mx-auto w-full max-w-[332px]">
                <div className="aspect-[9/16] w-full overflow-hidden rounded-[22px] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Greeting card preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="relative h-full w-full bg-white">
                      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[12px] font-medium text-[#8f8f8f]">
                        greetisizer.com
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {!hasGeneratedImage && (
              <p className="pt-1 text-center text-[11px] font-medium text-white/82">
                The real generated image will appear here once it is connected from the generation step.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}