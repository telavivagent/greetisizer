'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserEmail(user?.email ?? null)
      setLoading(false)
    }

    getUser()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserEmail(null)
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">GREETISIZER</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Home
            </button>

            <button
              onClick={() => router.push('/templates')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Templates
            </button>

            <button
              onClick={() => router.push('/saved')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Saved
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : userEmail ? (
          <>
            <p className="text-sm text-gray-600">
              Logged in as: <strong>{userEmail}</strong>
            </p>

            <div className="mt-6 grid gap-4">
              <Link
                href="/templates"
                className="block rounded-2xl border border-gray-200 bg-white p-4 text-black shadow-sm"
              >
                <strong className="text-lg font-semibold">
                  Browse Templates
                </strong>
              </Link>

              <Link
                href="/saved"
                className="block rounded-2xl border border-gray-200 bg-white p-4 text-black shadow-sm"
              >
                <strong className="text-lg font-semibold">
                  Saved Greetings
                </strong>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-600"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">You are not logged in.</p>

            <div className="mt-4">
              <Link
                href="/login"
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}