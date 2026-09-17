import { getAuthSession } from '@/lib/authStorage'

export type SetupOnboarding = 'safe-place' | 'safe-zone'

const storageKey = (onboarding: SetupOnboarding) =>
  `ibom:${getAuthSession()?.userId ?? 'guest'}:onboarding:${onboarding}:seen`

export function hasSeenSetupOnboarding(onboarding: SetupOnboarding) {
  return localStorage.getItem(storageKey(onboarding)) === 'true'
}

export function markSetupOnboardingSeen(onboarding: SetupOnboarding) {
  localStorage.setItem(storageKey(onboarding), 'true')
}
