import { useState, type FormEvent } from 'react'
import { login, signup, getFreeTierLimit, type AuthUser } from '../lib/auth'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onAuth: (user: AuthUser) => void
}

export function AuthModal({ open, onClose, onAuth }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('signup')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const reset = () => {
    setEmail('')
    setName('')
    setPassword('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name')
        setLoading(false)
        return
      }
      const res = await signup(email.trim(), name.trim(), password)
      if (res.ok) {
        reset()
        onAuth(res.user)
      } else {
        setError(res.error)
        setLoading(false)
      }
    } else {
      const res = await login(email.trim(), password)
      if (res.ok) {
        reset()
        onAuth(res.user)
      } else {
        setError(res.error)
        setLoading(false)
      }
    }
  }

  const freeLimit = getFreeTierLimit()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-sm mx-4 rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <img src="/nikium-icon.svg" alt="Nikium" className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-primary">Unlock All Lessons</h2>
          <p className="text-sm text-muted mt-1">
            You've reached the free limit ({freeLimit} lesson{freeLimit !== 1 ? 's' : ''}).
            Sign up to access all {freeLimit + 1}+ lessons for free.
          </p>
        </div>

        <div className="flex mx-6 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}>
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'text-primary'
                : 'text-muted'
            }`}
            style={tab === 'login' ? { background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' } : undefined}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('signup'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'signup'
                ? 'text-primary'
                : 'text-muted'
            }`}
            style={tab === 'signup' ? { background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' } : undefined}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-3">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs text-muted font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-primary border outline-none transition-colors placeholder:text-muted"
                style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 40%, transparent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-muted font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-primary border outline-none transition-colors placeholder:text-muted"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
              onFocus={e => e.target.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 40%, transparent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label className="block text-xs text-muted font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              required
              minLength={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-primary border outline-none transition-colors placeholder:text-muted"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
              onFocus={e => e.target.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 40%, transparent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg border text-xs" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="run-btn w-full justify-center text-sm font-semibold py-2.5"
            style={{
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {tab === 'signup' ? 'Creating account…' : 'Logging in…'}
              </span>
            ) : (
              tab === 'signup' ? 'Create Account' : 'Login'
            )}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-xs text-muted hover:text-primary transition-colors"
          >
            Maybe later
          </button>
        </form>
      </div>
    </div>
  )
}
