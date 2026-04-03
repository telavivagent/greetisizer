'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type SavedGreeting = {
  id: string
  user_id: string
  title: string | null
  final_message: string | null
  created_at: string
}

export default function SavedGreetingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = useMemo(() => createClient(), [])

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copying, setCopying] = useState(false)
  const [sharing, setSharing] = useState(false)

  const [savedGreeting, setSavedGreeting] = useState<SavedGreeting | null>(null)
  const [title, setTitle] = useState('')
  const [finalMessage, setFinalMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadGreeting = async () => {
      try {
        setLoading(true)
        setError('')
        setSuccess('')

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('saved_greetings')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          setError('Saved greeting not found.')
          return
        }

        setSavedGreeting(data)
        setTitle(data.title || '')
        setFinalMessage(data.final_message || '')
      } catch (err) {
        console.error(err)
        setError('Something went wrong while loading this greeting.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadGreeting()
    }
  }, [id, router, supabase])

  const handleSave = async () => {
    if (!savedGreeting) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const trimmedTitle = title.trim()
      const trimmedMessage = finalMessage.trim()

      const { error } = await supabase
        .from('saved_greetings')
        .update({
          title: trimmedTitle,
          final_message: trimmedMessage,
        })
        .eq('id', savedGreeting.id)
        .eq('user_id', savedGreeting.user_id)

      if (error) {
        setError('Could not save changes.')
        return
      }

      setSavedGreeting((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              final_message: trimmedMessage,
            }
          : prev
      )

      setSuccess('Changes saved.')
    } catch (err) {
      console.error(err)
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!savedGreeting) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this saved greeting?'
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('saved_greetings')
        .delete()
        .eq('id', savedGreeting.id)
        .eq('user_id', savedGreeting.user_id)

      if (error) {
        setError('Could not delete greeting.')
        return
      }

      router.push('/saved')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Could not delete greeting.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCopy = async () => {
    try {
      setCopying(true)
      setError('')
      setSuccess('')

      await navigator.clipboard.writeText(finalMessage || '')
      setSuccess('Greeting copied.')
    } catch (err) {
      console.error(err)
      setError('Could not copy greeting.')
    } finally {
      setCopying(false)
    }
  }

  const handleWhatsAppShare = () => {
    const textToShare = [title.trim(), finalMessage.trim()]
      .filter(Boolean)
      .join('\n\n')

    if (!textToShare) {
      setError('Nothing to share on WhatsApp.')
      return
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleNativeShare = async () => {
    const textToShare = [title.trim(), finalMessage.trim()]
      .filter(Boolean)
      .join('\n\n')

    if (!textToShare) {
      setError('Nothing to share.')
      return
    }

    try {
      setSharing(true)
      setError('')
      setSuccess('')

      if (navigator.share) {
        await navigator.share({
          title: title.trim() || 'Greeting',
          text: textToShare,
        })
        setSuccess('Shared successfully.')
      } else {
        await navigator.clipboard.writeText(textToShare)
        setSuccess('Share not supported on this device. Greeting copied instead.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-6">
        <div className="mx-auto w-full max-w-xl">
          <p className="text-sm text-gray-600">Loading saved greeting...</p>
        </div>
      </main>
    )
  }

  if (!savedGreeting) {
    return (
      <main className="min-h-screen bg-white px-4 py-6">
        <div className="mx-auto w-full max-w-xl">
          <button
            onClick={() => router.push('/saved')}
            className="mb-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Back
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900">
              Saved Greeting
            </h1>
            <p className="mt-2 text-sm text-red-600">
              {error || 'Saved greeting not found.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        <button
          onClick={() => router.push('/saved')}
          className="mb-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Back
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Saved Greeting</h1>

          {error ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          ) : null}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Greeting Message
            </label>
            <textarea
              value={finalMessage}
              onChange={(e) => setFinalMessage(e.target.value)}
              placeholder="Write your greeting here"
              rows={10}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              onClick={handleCopy}
              disabled={copying}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 disabled:opacity-60"
            >
              {copying ? 'Copying...' : 'Copy Greeting'}
            </button>

            <button
              onClick={handleNativeShare}
              disabled={sharing}
              className="rounded-xl border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-700 disabled:opacity-60"
            >
              {sharing ? 'Sharing...' : 'Share'}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-700"
            >
              Share on WhatsApp
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60 sm:col-span-2"
            >
              {deleting ? 'Deleting...' : 'Delete Greeting'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}