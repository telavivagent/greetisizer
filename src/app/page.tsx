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
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '18px',
    border: '1px solid rgba(11, 92, 79, 0.12)',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(6px)',
    boxShadow: '0 10px 30px rgba(11, 92, 79, 0.08)',
  }

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '14px',
    border: 'none',
    background:
      'linear-gradient(135deg, #0b5c4f 0%, #0f7a67 55%, #c9982f 100%)',
    color: '#fffaf0',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(11, 92, 79, 0.18)',
  }

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(11, 92, 79, 0.14)',
    background: '#fffdf8',
    color: '#153b35',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.04)',
  }

  const logoutButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(166, 47, 47, 0.22)',
    background: '#fff8f7',
    color: '#a62f2f',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '24px 16px 32px',
        background:
          'radial-gradient(circle at top, rgba(201,152,47,0.16), transparent 28%), linear-gradient(180deg, #fbf7ef 0%, #f7f1e6 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <section
          style={{
            ...cardStyle,
            padding: '26px 20px 22px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-20px',
              width: '120px',
              height: '120px',
              borderRadius: '999px',
              background: 'rgba(201, 152, 47, 0.08)',
              filter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-24px',
              width: '130px',
              height: '130px',
              borderRadius: '999px',
              background: 'rgba(11, 92, 79, 0.06)',
              filter: 'blur(2px)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <img
              src="/icon.png"
              alt="Greetisizer Icon"
              style={{
                width: '118px',
                height: '118px',
                objectFit: 'contain',
                margin: '0 auto 10px',
                display: 'block',
              }}
            />

            <div
              style={{
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '999px',
                background: 'rgba(201, 152, 47, 0.12)',
                color: '#9b6f16',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Premium Greetings
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                lineHeight: 1.1,
                fontWeight: 800,
                color: '#123a34',
                letterSpacing: '0.02em',
              }}
            >
              GREETISIZER
            </h1>

            <p
              style={{
                margin: '12px auto 0',
                maxWidth: '290px',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#51645f',
              }}
            >
              Create graceful, festive greeting messages with a rich premium feel.
            </p>
          </div>
        </section>

        {!email ? (
          <section style={{ ...cardStyle, padding: '18px' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={primaryButtonStyle}>Login to Begin</button>
            </Link>
          </section>
        ) : (
          <>
            <section style={{ ...cardStyle, padding: '16px 18px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6a7874',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                Logged in as
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#153b35',
                  fontWeight: 700,
                  wordBreak: 'break-word',
                }}
              >
                {email}
              </div>
            </section>

            <section
              style={{
                ...cardStyle,
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <Link href="/templates" style={{ textDecoration: 'none' }}>
                <button style={primaryButtonStyle}>Browse Templates</button>
              </Link>

              <Link href="/saved" style={{ textDecoration: 'none' }}>
                <button style={secondaryButtonStyle}>Saved Greetings</button>
              </Link>

              <button onClick={handleLogout} style={logoutButtonStyle}>
                Logout
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  )
}