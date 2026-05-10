'use client'

import { useState } from 'react'
import { getBrowserSupabase } from '../../lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendLink() {
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = getBrowserSupabase()
    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.')
      setLoading(false)
      return
    }
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
      },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="border border-border bg-bgCard p-10 max-w-md w-full">
        <p className="text-gold text-xs tracking-[0.3em]">SIGN IN</p>
        <h1 className="font-serif text-3xl mt-3">Welcome back, recruit.</h1>

        {sent ? (
          <>
            <p className="text-gold text-xs tracking-widest mt-8">LINK SENT</p>
            <p className="text-textMuted text-sm mt-3">
              Check <span className="text-text">{email}</span> and click the link to finish signing in.
            </p>
          </>
        ) : (
          <>
            <p className="text-textMuted text-sm mt-4">
              Magic-link sign-in via Supabase. Enter your email and we'll send you a link.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendLink()}
              placeholder="you@example.com"
              className="w-full mt-6 bg-bg border border-border px-4 py-3 text-text"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button
              onClick={sendLink}
              disabled={loading}
              className="w-full mt-3 bg-gold text-bg py-3 font-semibold tracking-widest text-sm disabled:opacity-50"
            >
              {loading ? 'SENDING...' : 'SEND LINK'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
