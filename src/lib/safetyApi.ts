import { apiRequest } from '@/lib/api'

export type SafePlace = {
  id: number
  name: string
  address: string
  detailAddress?: string
  iconType: number
  lat: number
  lon: number
  createdAt: string
  updatedAt: string
}

export type SafePlaceInput = Pick<
  SafePlace,
  'name' | 'address' | 'detailAddress' | 'iconType' | 'lat' | 'lon'
>

export const listSafePlaces = (query = '') =>
  apiRequest<SafePlace[]>(
    `/api/safe-places${query ? `?query=${encodeURIComponent(query)}` : ''}`,
    { device: true },
  )

export const createSafePlace = (input: SafePlaceInput) =>
  apiRequest<SafePlace>('/api/safe-places', {
    method: 'POST',
    device: true,
    body: input,
  })

export const getSafePlace = (id: number) =>
  apiRequest<SafePlace>(`/api/safe-places/${id}`, { device: true })

export const updateSafePlace = (id: number, input: SafePlaceInput) =>
  apiRequest<SafePlace>(`/api/safe-places/${id}`, {
    method: 'PUT',
    device: true,
    body: input,
  })

export const deleteSafePlace = (id: number) =>
  apiRequest<void>(`/api/safe-places/${id}`, { method: 'DELETE', device: true })

export type SafeZone = {
  id: number
  name: string
  centerLat: number
  centerLon: number
  radiusM: number
  createdAt: string
  updatedAt: string
}

export const listSafeZones = () =>
  apiRequest<SafeZone[]>('/api/safe-zones', { device: true })

export const createSafeZone = (
  input: Omit<SafeZone, 'id' | 'createdAt' | 'updatedAt'>,
) =>
  apiRequest<SafeZone>('/api/safe-zones', {
    method: 'POST',
    device: true,
    body: input,
  })

export const getSafeZone = (id: number) =>
  apiRequest<SafeZone>(`/api/safe-zones/${id}`, { device: true })

export const updateSafeZone = (
  id: number,
  input: Omit<SafeZone, 'id' | 'createdAt' | 'updatedAt'>,
) =>
  apiRequest<SafeZone>(`/api/safe-zones/${id}`, {
    method: 'PUT',
    device: true,
    body: input,
  })

export const deleteSafeZone = (id: number) =>
  apiRequest<void>(`/api/safe-zones/${id}`, { method: 'DELETE', device: true })

export type SafeZoneCheck = {
  lat: number
  lon: number
  zoneCount: number
  inside: boolean
  nearestZoneId?: number
}

export const checkSafeZones = (lat: number, lon: number) =>
  apiRequest<SafeZoneCheck>(`/api/safe-zones/check?lat=${lat}&lon=${lon}`, {
    device: true,
  })

export type RiskZone = {
  zoneId: string
  type: string
  lat: number
  lng: number
  radiusM: number
  riskScore: number
  grade: string
  epdo: number
  accidents: number
  fatalities: number
  serious: number
  minor: number
  district: string
  roadName: string
  roadType: string
  topAccidentType: string
}

type Bounds = { swLat: number; swLng: number; neLat: number; neLng: number }

export const listRiskZones = (bounds: Bounds) =>
  apiRequest<RiskZone[]>(
    `/api/zones?${new URLSearchParams(
      Object.entries(bounds).map(([key, value]) => [key, String(value)]),
    )}`,
  )

export type HazardGrid = {
  gridId: string
  lat: number
  lng: number
  sizeM: number
  riskScore: number
  grade: string
  hasAccident: boolean
  accidentCount: number
  epdo: number
  fatalities: number
  cctvDistM: number
  cctvCount200m: number
  schoolZoneDistM: number
  inSchoolZone: boolean
  intersectionAccidents300m: number
}

export const listHazardGrids = (bounds: Bounds, minRisk = 0) =>
  apiRequest<HazardGrid[]>(
    `/api/grids?${new URLSearchParams([
      ...Object.entries(bounds).map(([key, value]) => [key, String(value)]),
      ['minRisk', String(minRisk)],
    ])}`,
  )

export type AiExplanation = {
  summary: string
  message: string
  action: string
}

export const getZoneExplanation = (zoneId: string) =>
  apiRequest<AiExplanation>(
    `/api/ai-explain?zoneId=${encodeURIComponent(zoneId)}`,
  )

export type Facility = {
  facilityId: string
  type: 'CCTV' | 'SCHOOL_ZONE'
  purpose?: string
  lat: number
  lng: number
  name?: string
  cameraCount?: number
  radiusM?: number
  address?: string
}

export const listFacilities = (bounds: Bounds) =>
  apiRequest<Facility[]>(
    `/api/facilities?${new URLSearchParams(
      Object.entries(bounds).map(([key, value]) => [key, String(value)]),
    )}`,
  )

type Page<T> = { content: T[] }

export type SafetyBell = {
  id: number
  installPurpose: string
  address: string
  dong: string
  lat: number
  lon: number
  policeLinked: boolean
  manageOrg: string
}

export const listSafetyBells = () =>
  apiRequest<Page<SafetyBell>>('/api/safety-bells?page=0&size=1000')

export type Cctv = {
  id: number
  type: string
  address: string
  detail: string
  dong: string
  lat: number
  lon: number
  cameras: number
}

export const listCctv = () =>
  apiRequest<Page<Cctv>>('/api/cctv?page=0&size=1000')

export type TrafficAccident = {
  id: number
  accidentType: string
  locationName: string
  accidentCount: number
  casualtyCount: number
  deathCount: number
  seriousInjuryCount: number
  minorInjuryCount: number
  lat: number
  lon: number
}

export const listTrafficAccidents = () =>
  apiRequest<Page<TrafficAccident>>(
    '/api/traffic-accidents?sido=%EA%B2%BD%EA%B8%B0%EB%8F%84&page=0&size=1000',
  )
