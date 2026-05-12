'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '../../lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function signIn() {
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = getBrowserSupabase()
    if (!supabase) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }
    const { data, error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
        shouldCreateUser: true,
      },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    // With autoconfirm on, a session is returned immediately — redirect to dashboard.
    if (data.session) {
      router.push('/dashboard')
      return
    }
    // Fallback: autoconfirm may not be on, show a friendlier message.
    setError('Check your email for a sign-in link and open it on this computer.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="border border-border bg-bgCard p-10 max-w-md w-full">
        <p className="text-gold text-xs tracking-[0.3em]">SIGN IN</p>
        <h1 className="font-serif text-3xl mt-3">Welcome back, recruit.</h1>
        <p className="text-textMuted text-sm mt-4">Enter your email to sign in or create an account.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && signIn()}
          placeholder="you@example.com"
          className="w-full mt-6 bg-bg border border-border px-4 py-3 text-text"
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full mt-3 bg-gold text-bg py-3 font-semibold tracking-widest text-sm disabled:opacity-50"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </div>
    </main>
  )
}
