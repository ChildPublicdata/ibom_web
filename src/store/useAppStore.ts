import { create } from 'zustand'
type AppState = {
  selectedChildId: string | null
  setSelectedChildId: (childId: string | null) => void
  safePlacePosition: { lat: number; lng: number } | null
  setSafePlacePosition: (position: { lat: number; lng: number }) => void
}
export const useAppStore = create<AppState>((set) => ({
  selectedChildId: null,
  setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
  safePlacePosition: null,
  setSafePlacePosition: (safePlacePosition) => set({ safePlacePosition }),
}))
