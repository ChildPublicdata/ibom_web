import { create } from 'zustand'
import type { UserRole } from '@/lib/authStorage'

type AppState = {
  selectedRole: UserRole | null
  setSelectedRole: (role: UserRole) => void
  signupDraft: { email: string; password: string; phoneNumber: string } | null
  setSignupDraft: (draft: AppState['signupDraft']) => void
  selectedChildId: string | null
  setSelectedChildId: (childId: string | null) => void
  safePlacePosition: { lat: number; lng: number } | null
  setSafePlacePosition: (position: { lat: number; lng: number }) => void
  safePlaceDraft: {
    name: string
    address: string
    position: { lat: number; lng: number }
  } | null
  setSafePlaceDraft: (draft: AppState['safePlaceDraft']) => void
}
export const useAppStore = create<AppState>((set) => ({
  selectedRole: null,
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  signupDraft: null,
  setSignupDraft: (signupDraft) => set({ signupDraft }),
  selectedChildId: null,
  setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
  safePlacePosition: null,
  setSafePlacePosition: (safePlacePosition) => set({ safePlacePosition }),
  safePlaceDraft: null,
  setSafePlaceDraft: (safePlaceDraft) => set({ safePlaceDraft }),
}))
