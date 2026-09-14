import { apiRequest } from '@/lib/api'
import type { AuthSession, UserRole } from '@/lib/authStorage'

export type SignupInput = {
  email: string
  password: string
  name: string
  phoneNumber: string
  role: UserRole
}

export const signup = (input: SignupInput) =>
  apiRequest<AuthSession>('/api/auth/signup', {
    method: 'POST',
    body: input,
  })

export const login = (email: string, password: string) =>
  apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
