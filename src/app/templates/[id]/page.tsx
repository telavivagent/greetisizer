'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Template = {
  id: string
  title: string | null
  message_text: string | null
  language_code: string | null
}

export default function TemplateDetailPage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true)
      setStatusMessage('')
      setErrorMessage('')

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setTemplate(data)
        setMessage(data.message_text || '')
      } else {
        setErrorMessage('Template not found.')
      }

      setLoading(false)
    }

    if (id) {
      fetchTemplate()
    }
  }, [id, supabase])

  async function handleSaveGreeting() {
    if (!template) return

    setSaving(true)
    setStatusMessage('Saving...')
    setErrorMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setStatusMessage('')
      setErrorMessage('Please log in first.')
      setSaving(false)
      router.push('/login')
      return
    }

    const { error } = await supabase.from('saved_greetings').insert({
      user_id: user.id,
      template_id: template.id,
      title: template.title,
      final_message: message,
      language_code: template.language_code,
      status: 'draft',
    })

    if (error) {
      setStatusMessage('')
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setStatusMessage('Greeting saved successfully.')
    setSaving(false)
    router.push('/saved')
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Template</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Home
            </button>

            <button
              onClick={() => router.push('/saved')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Saved
            </button>

            <button
              onClick={() => router.push('/templates')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Templates
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/templates')}
          className="mb-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Back to Templates
        </button>

        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : !template ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-red-600">
              {errorMessage || 'Template not found.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {template.title || 'Untitled Template'}
            </h2>

            {errorMessage ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {statusMessage}
              </p>
            ) : null}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Greeting Message
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <button
              onClick={handleSaveGreeting}
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Greeting'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}