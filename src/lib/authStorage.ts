export type UserRole = 'PARENT' | 'CHILD'

export type AuthSession = {
  token: string
  userId: number
  name: string
  role: UserRole
}

const AUTH_SESSION_KEY = 'ibom-auth-session'

export function getAuthSession(): AuthSession | null {
  const value = localStorage.getItem(AUTH_SESSION_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as AuthSession
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}

export function getAccessToken() {
  return getAuthSession()?.token ?? null
}
