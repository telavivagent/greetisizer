'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | ''>('')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoadingAction('signup')
    setMessage('Creating account...')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoadingAction('')
      return
    }

    setMessage('Signup successful. Please check your email.')
    setLoadingAction('')
    router.push('/')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoadingAction('login')
    setMessage('Logging in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoadingAction('')
      return
    }

    setMessage('Login successful.')
    setLoadingAction('')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Login / Signup</h1>

          <button
            onClick={() => router.push('/')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Home
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <form className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loadingAction !== ''}
              className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loadingAction === 'login' ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loadingAction !== ''}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 disabled:opacity-60"
            >
              {loadingAction === 'signup' ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  )
}