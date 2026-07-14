const FREE_TIER_LIMIT = 999
const TOKEN_KEY = 'nikium_token'
const USER_KEY = 'nikium_user'

export interface AuthUser {
  email: string
  name: string
}

function getApiUrl(): string {
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return getToken() !== null && getStoredUser() !== null
}

export function isExampleAccessible(index: number): boolean {
  return index < FREE_TIER_LIMIT || isLoggedIn()
}

export function getFreeTierLimit(): number {
  return FREE_TIER_LIMIT
}

export async function signup(email: string, name: string, password: string): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const resp = await fetch(`${getApiUrl()}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    const data = await resp.json()
    if (resp.ok) {
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return { ok: true, user: data.user }
    }
    return { ok: false, error: data.error || 'Signup failed' }
  } catch (err) {
    return { ok: false, error: `Server error: ${err}` }
  }
}

export async function login(email: string, password: string): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const resp = await fetch(`${getApiUrl()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await resp.json()
    if (resp.ok) {
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return { ok: true, user: data.user }
    }
    return { ok: false, error: data.error || 'Login failed' }
  } catch (err) {
    return { ok: false, error: `Server error: ${err}` }
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function checkSession(): Promise<AuthUser | null> {
  const token = getToken()
  if (!token) return null

  try {
    const resp = await fetch(`${getApiUrl()}/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (resp.ok) {
      const data = await resp.json()
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        return data.user
      }
    }
    // Token invalid
    logout()
    return null
  } catch {
    // Offline — use cached user
    return getStoredUser()
  }
}
