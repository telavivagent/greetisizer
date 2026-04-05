'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState<'login' | 'signup' | 'google' | ''>('')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      if (session) {
        router.replace('/occasion')
        return
      }

      setCheckingSession(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/occasion')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase])

  async function handleLogin() {
    if (!email || !password) {
      setMessage('Please fill in your email and password.')
      return
    }

    setLoading('login')
    setMessage('Logging in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading('')
      return
    }

    setMessage('Login successful.')
    setLoading('')
    router.replace('/occasion')
  }

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading('signup')
    setMessage('Creating account...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading('')
      return
    }

    setLoading('')

    if (data.session) {
      setMessage('Account created successfully.')
      router.replace('/occasion')
      return
    }

    setMessage('Signup successful. Please check your email, then log in.')
    setAuthMode('login')
  }

  async function handleGoogleLogin() {
    setLoading('google')
    setMessage('Opening Google login...')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading('')
    }
  }

  if (checkingSession) {
    return (
      <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <div className="flex aspect-[390/844] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] px-6 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div>
              <div className="text-2xl font-black text-white">GREETISIZER</div>
              <p className="mt-3 text-sm text-white/80">Checking your login...</p>
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
          <div className="flex flex-1 flex-col px-6 pb-6 pt-7 sm:px-7 sm:pt-8">
            <button
              onClick={() => router.push('/')}
              className="mb-6 inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm"
            >
              ← Back
            </button>

            <div className="mb-6">
              <h1 className="text-[40px] font-black leading-[0.98] tracking-[-0.03em] text-white">
                {authMode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/75">
                {authMode === 'login'
                  ? 'Sign in to continue creating your greeting card.'
                  : 'Sign up to start creating your greeting card.'}
              </p>
            </div>

            <div className="mb-5 flex rounded-full bg-white/12 p-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-extrabold transition ${
                  authMode === 'login'
                    ? 'bg-white text-[#b31357]'
                    : 'text-white/75'
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-extrabold transition ${
                  authMode === 'signup'
                    ? 'bg-white text-[#b31357]'
                    : 'text-white/75'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading !== ''}
                className="w-full rounded-2xl bg-white px-4 py-4 text-sm font-extrabold text-[#1f0b14] shadow-[0_10px_22px_rgba(0,0,0,0.10)] disabled:opacity-60"
              >
                {loading === 'google' ? 'Opening Google...' : 'Continue with Gmail'}
              </button>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/45 outline-none backdrop-blur-sm"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/45 outline-none backdrop-blur-sm"
              />

              {authMode === 'signup' ? (
                <input
                  type="password"
                  placeholder="Write password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/45 outline-none backdrop-blur-sm"
                />
              ) : null}
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/90 backdrop-blur-sm">
                {message}
              </div>
            ) : null}

            <div className="mt-auto pt-6">
              {authMode === 'login' ? (
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading !== ''}
                  className="w-full rounded-full bg-white px-6 py-4 text-lg font-black text-[#1f0b14] shadow-[0_14px_30px_rgba(0,0,0,0.18)] disabled:opacity-60"
                >
                  {loading === 'login' ? 'Logging in...' : 'Login'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading !== ''}
                  className="w-full rounded-full bg-white px-6 py-4 text-lg font-black text-[#1f0b14] shadow-[0_14px_30px_rgba(0,0,0,0.18)] disabled:opacity-60"
                >
                  {loading === 'signup' ? 'Creating account...' : 'Create account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}