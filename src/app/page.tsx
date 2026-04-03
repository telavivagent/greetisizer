'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function Home() {
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email ?? null)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* ICON */}
      <div style={{ marginTop: '30px' }}>
        <img
          src="/icon.png"
          alt="Greetisizer Icon"
          style={{ width: '140px', height: 'auto' }}
        />
      </div>

      {/* TITLE */}
      <h1
        style={{
          marginTop: '15px',
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        GREETISIZER
      </h1>

      {/* SUBTITLE */}
      <p
        style={{
          marginTop: '5px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        Create beautiful greetings instantly
      </p>

      {!email ? (
        <div style={{ marginTop: '40px' }}>
          <Link href="/login">
            <button
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#000',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Go to Login
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: '30px',
            width: '100%',
            maxWidth: '350px',
          }}
        >
          <p style={{ marginBottom: '10px', fontSize: '14px' }}>
            Logged in as: {email}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/templates">
              <button
                style={{
                  padding: '14px',
                  width: '100%',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Browse Templates
              </button>
            </Link>

            <Link href="/saved">
              <button
                style={{
                  padding: '14px',
                  width: '100%',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Saved Greetings
              </button>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '14px',
                width: '100%',
                borderRadius: '10px',
                border: '1px solid red',
                color: 'red',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </main>
  )
}