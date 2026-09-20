import { apiBlob, apiRequest } from '@/lib/api'

export type Complaint = {
  id: number
  lat: number
  lon: number
  content: string
  hasPhoto: boolean
  createdAt: string
}

type CreateComplaintInput = {
  lat: number
  lon: number
  content: string
  photo?: File
}

export const listComplaints = () =>
  apiRequest<Complaint[]>('/api/complaints', { auth: true })

export const createComplaint = ({
  lat,
  lon,
  content,
  photo,
}: CreateComplaintInput) => {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    content,
  })
  const formData = new FormData()
  if (photo) formData.append('photo', photo)

  return apiRequest<Complaint>(`/api/complaints?${query}`, {
    method: 'POST',
    auth: true,
    body: formData,
  })
}

export const getComplaintPhoto = (id: number) =>
  apiBlob(`/api/complaints/${id}/photo`, true)
