'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type SavedGreeting = {
  id: string
  user_id: string
  title: string | null
  final_message: string | null
  created_at: string
}

export default function SavedGreetingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [savedGreetings, setSavedGreetings] = useState<SavedGreeting[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadSavedGreetings = async () => {
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          setError('Could not load saved greetings.')
          return
        }

        setSavedGreetings(data || [])
      } catch (err) {
        console.error(err)
        setError('Something went wrong while loading saved greetings.')
      } finally {
        setLoading(false)
      }
    }

    loadSavedGreetings()
  }, [router, supabase])

  const handleCopy = async (message: string | null, id: string) => {
    try {
      setCopyingId(id)
      setError('')
      setSuccess('')

      await navigator.clipboard.writeText(message || '')
      setSuccess('Greeting copied.')
    } catch (err) {
      console.error(err)
      setError('Could not copy greeting.')
    } finally {
      setCopyingId(null)
    }
  }

  const handleWhatsAppShare = (title: string | null, message: string | null) => {
    setError('')
    setSuccess('')

    const textToShare = [title?.trim(), message?.trim()]
      .filter(Boolean)
      .join('\n\n')

    if (!textToShare) {
      setError('Nothing to share on WhatsApp.')
      return
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this saved greeting?'
    )

    if (!confirmed) return

    try {
      setDeletingId(id)
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

      const { error } = await supabase
        .from('saved_greetings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        setError('Could not delete greeting.')
        return
      }

      setSavedGreetings((prev) => prev.filter((item) => item.id !== id))
      setSuccess('Greeting deleted.')
    } catch (err) {
      console.error(err)
      setError('Could not delete greeting.')
    } finally {
      setDeletingId(null)
    }
  }

  const getPreviewText = (text: string | null) => {
    if (!text) return ''
    if (text.length <= 140) return text
    return text.slice(0, 140) + '...'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-6">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="text-2xl font-bold text-gray-900">Saved Greetings</h1>
          <p className="mt-4 text-sm text-gray-600">Loading saved greetings...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Saved Greetings</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Home
            </button>

            <button
              onClick={() => router.push('/templates')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Templates
            </button>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        ) : null}

        {savedGreetings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">No saved greetings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedGreetings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {item.title?.trim() || 'Untitled Greeting'}
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                  {getPreviewText(item.final_message)}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button
                    onClick={() => router.push(`/saved/${item.id}`)}
                    className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleCopy(item.final_message, item.id)}
                    disabled={copyingId === item.id}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 disabled:opacity-60"
                  >
                    {copyingId === item.id ? 'Copying...' : 'Copy'}
                  </button>

                  <button
                    onClick={() =>
                      handleWhatsAppShare(item.title, item.final_message)
                    }
                    className="rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-700"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}