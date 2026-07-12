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
        className="w-full max-w-sm mx-4 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        style={{ background: '#13131b' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg mx-auto mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            N
          </div>
          <h2 className="text-lg font-bold text-white">Unlock All Lessons</h2>
          <p className="text-sm text-slate-500 mt-1">
            You've reached the free limit ({freeLimit} lesson{freeLimit !== 1 ? 's' : ''}).
            Sign up to access all {freeLimit + 1}+ lessons.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex mx-6 rounded-lg border border-white/[0.06] overflow-hidden" style={{ background: '#0e0e16' }}>
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={tab === 'login' ? { background: 'rgba(99,102,241,0.12)' } : undefined}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('signup'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'signup'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={tab === 'signup' ? { background: 'rgba(99,102,241,0.12)' } : undefined}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-3">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/[0.08] outline-none transition-colors placeholder:text-slate-600"
                style={{ background: '#0a0a10' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/[0.08] outline-none transition-colors placeholder:text-slate-600"
              style={{ background: '#0a0a10' }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              required
              minLength={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/[0.08] outline-none transition-colors placeholder:text-slate-600"
              style={{ background: '#0a0a10' }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg border border-red-500/20 text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.06)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-indigo-500/25 active:scale-[0.98]'
            }`}
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
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
            className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Maybe later
          </button>
        </form>
      </div>
    </div>
  )
}
