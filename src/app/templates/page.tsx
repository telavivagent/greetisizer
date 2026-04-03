'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Template = {
  id: string
  title: string | null
  short_preview: string | null
}

export default function TemplatesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase.from('templates').select('*')

      if (!error && data) {
        setTemplates(data)
      }

      setLoading(false)
    }

    fetchTemplates()
  }, [supabase])

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>

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
              Saved Greetings
            </button>

            <button
              onClick={() => router.push('/templates')}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Templates
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">No templates yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {templates.map((t) => (
              <Link
                href={`/templates/${t.id}`}
                key={t.id}
                className="block rounded-2xl border border-gray-200 bg-white p-4 text-black shadow-sm transition hover:border-gray-300"
              >
                <strong className="block text-lg font-semibold text-gray-900">
                  {t.title || 'Untitled Template'}
                </strong>
                <p className="mt-2 text-sm text-gray-600">
                  {t.short_preview || ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}