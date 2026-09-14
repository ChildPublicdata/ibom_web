import { apiRequest } from '@/lib/api'

export type IssueCodeResponse = { code: string; expiresAt: string }
export type RedeemCodeResponse = {
  childId: number
  childName: string
  linkedAt: string
}
export type LocationResponse = { lat: number; lon: number; updatedAt: string }
export type ChildSummary = {
  childId: number
  name: string
  lat: number | null
  lon: number | null
  updatedAt: string | null
}

export const issueFamilyCode = () =>
  apiRequest<IssueCodeResponse>('/api/family/codes', {
    method: 'POST',
    auth: true,
  })

export const redeemFamilyCode = (code: string) =>
  apiRequest<RedeemCodeResponse>('/api/family/redeem', {
    method: 'POST',
    auth: true,
    body: { code },
  })

export const reportChildLocation = (lat: number, lon: number) =>
  apiRequest<LocationResponse>('/api/family/location', {
    method: 'POST',
    auth: true,
    body: { lat, lon },
  })

export const listChildren = () =>
  apiRequest<ChildSummary[]>('/api/family/children', { auth: true })

export const getChildLocation = (childId: number) =>
  apiRequest<LocationResponse>(`/api/family/children/${childId}/location`, {
    auth: true,
  })
