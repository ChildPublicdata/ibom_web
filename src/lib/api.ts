import { clearAuthSession, getAccessToken } from '@/lib/authStorage'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'https://publicdatabackend-production.up.railway.app'
).replace(/\/$/, '')

const DEVICE_ID_KEY = 'ibom-device-id'

export function getDeviceId() {
  const savedId = localStorage.getItem(DEVICE_ID_KEY)
  if (savedId) return savedId

  const deviceId = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, deviceId)
  return deviceId
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown | FormData
  device?: boolean
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const {
    body,
    device = false,
    auth = false,
    headers,
    ...requestOptions
  } = options
  const token = auth ? getAccessToken() : null
  if (auth && !token) throw new Error('로그인이 필요합니다.')
  const isFormData = body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(body === undefined || isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(device ? { 'X-Device-Id': getDeviceId() } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text()
    if (response.status === 401 && auth) clearAuthSession()
    let errorMessage = message
    try {
      errorMessage =
        (JSON.parse(message) as { message?: string }).message ?? message
    } catch {
      // Plain-text errors are already suitable for display.
    }
    throw new Error(
      errorMessage || `API 요청에 실패했습니다. (${response.status})`,
    )
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function apiBlob(path: string, auth = false) {
  const token = auth ? getAccessToken() : null
  if (auth && !token) throw new Error('로그인이 필요합니다.')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!response.ok) {
    if (response.status === 401 && auth) clearAuthSession()
    throw new Error(`파일을 불러오지 못했습니다. (${response.status})`)
  }
  return response.blob()
}
