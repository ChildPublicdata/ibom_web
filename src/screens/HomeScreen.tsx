import { useEffect, useMemo, useRef, useState } from 'react'
import headerLogo from '@/assets/header-logo.svg'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import homeMyLocationIcon from '@/assets/icons/home-my-location.svg'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { PhoneCallButton } from '@/components/CallModal'
import { NotificationButton } from '@/components/NotificationButton'
import {
  KakaoMap,
  type KakaoMapBounds,
  type KakaoMapCoordinate,
  type KakaoMapMarker,
} from '@/components/KakaoMap'
import {
  searchPlacesInBounds,
  type KakaoPlace,
  type PlaceSearchKind,
} from '@/lib/kakaoPlaces'
import { getAuthSession } from '@/lib/authStorage'
import {
  getChildLocation,
  listChildren,
  reportChildLocation,
} from '@/lib/familyApi'
import {
  listFacilities,
  listSafeZones,
  type Facility,
  type SafeZone,
} from '@/lib/safetyApi'
import { useAppStore } from '@/store/useAppStore'
import { childMotionImage } from '@/lib/childMotion'

const categories: PlaceSearchKind[] = [
  '소아과',
  '병원',
  '약국',
  '경찰서',
  '어린이보호구역',
]
function formatDistance(meters: number) {
  return meters < 1000
    ? `${meters.toLocaleString()}m`
    : `${(meters / 1000).toFixed(1)}km`
}

function movementBetween(
  previous: KakaoMapCoordinate,
  current: KakaoMapCoordinate,
) {
  const toRadians = (degree: number) => (degree * Math.PI) / 180
  const latitudeDelta = toRadians(current.lat - previous.lat)
  const longitudeDelta = toRadians(current.lng - previous.lng)
  const latitude1 = toRadians(previous.lat)
  const latitude2 = toRadians(current.lat)
  const distance =
    6_371_000 *
    2 *
    Math.atan2(
      Math.sqrt(
        Math.sin(latitudeDelta / 2) ** 2 +
          Math.cos(latitude1) *
            Math.cos(latitude2) *
            Math.sin(longitudeDelta / 2) ** 2,
      ),
      Math.sqrt(
        1 -
          (Math.sin(latitudeDelta / 2) ** 2 +
            Math.cos(latitude1) *
              Math.cos(latitude2) *
              Math.sin(longitudeDelta / 2) ** 2),
      ),
    )
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2)
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta)
  const heading = (Math.atan2(y, x) * 180) / Math.PI
  return { distance, heading: (heading + 360) % 360 }
}

function formatUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) return '위치 시간 확인 중'
  const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(updatedAt)
  const date = new Date(hasTimeZone ? updatedAt : `${updatedAt}Z`)
  if (Number.isNaN(date.getTime())) return '최신 위치'
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function HomeScreen() {
  const isChild = getAuthSession()?.role === 'CHILD'
  const [childPosition, setChildPosition] = useState<KakaoMapCoordinate | null>(
    null,
  )
  const [mapCenter, setMapCenter] = useState<KakaoMapCoordinate | null>(null)
  const [myPosition, setMyPosition] = useState<KakaoMapCoordinate | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceSearchKind | null>(null)
  const [mapBounds, setMapBounds] = useState<KakaoMapBounds | null>(null)
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChildMoving, setIsChildMoving] = useState(false)
  const [childHeading, setChildHeading] = useState<number | null>(null)
  const [childName, setChildName] = useState(
    () => getAuthSession()?.name ?? '우리 아이',
  )
  const [childUpdatedAt, setChildUpdatedAt] = useState<string | null>(null)
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([])
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)
  const sheetPointerY = useRef<number | null>(null)
  const previousChildPosition = useRef<KakaoMapCoordinate | null>(null)
  const selectedChildId = useAppStore((state) => state.selectedChildId)
  const setSelectedChildId = useAppStore((state) => state.setSelectedChildId)

  const updateChildPosition = (position: KakaoMapCoordinate) => {
    const previous = previousChildPosition.current
    if (previous) {
      const movement = movementBetween(previous, position)
      const moving = movement.distance >= 3
      setIsChildMoving(moving)
      if (moving) setChildHeading(movement.heading)
    }
    previousChildPosition.current = position
    setChildPosition(position)
  }

  useEffect(() => {
    const session = getAuthSession()
    if (!session) return

    if (session.role === 'CHILD') {
      if (!navigator.geolocation) return
      const watchId = navigator.geolocation.watchPosition(
        ({ coords, timestamp }) => {
          const position = { lat: coords.latitude, lng: coords.longitude }
          updateChildPosition(position)
          setMapCenter(position)
          setChildUpdatedAt(new Date(timestamp).toISOString())
          reportChildLocation(position.lat, position.lng)
            .then((location) => setChildUpdatedAt(location.updatedAt))
            .catch(() => undefined)
        },
        () => setError('현재 위치 권한을 허용해 주세요.'),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }

    let cancelled = false
    const refreshChildLocation = async () => {
      try {
        const children = await listChildren()
        if (cancelled || children.length === 0) return
        const selected =
          children.find((child) => String(child.childId) === selectedChildId) ??
          children[0]
        setSelectedChildId(String(selected.childId))
        setChildName(selected.name)
        const location = await getChildLocation(selected.childId)
        if (cancelled) return
        const position = { lat: location.lat, lng: location.lon }
        updateChildPosition(position)
        setMapCenter(position)
        setChildUpdatedAt(location.updatedAt)
      } catch (locationError) {
        if (!cancelled)
          setError(
            locationError instanceof Error
              ? locationError.message
              : '자녀 위치를 불러오지 못했습니다.',
          )
      }
    }
    void refreshChildLocation()
    const timer = window.setInterval(refreshChildLocation, 10000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [selectedChildId, setSelectedChildId])

  useEffect(() => {
    listSafeZones()
      .then(setSafeZones)
      .catch(() => setSafeZones([]))
  }, [])

  const childAreaKey = childPosition
    ? `${childPosition.lat.toFixed(3)}:${childPosition.lng.toFixed(3)}`
    : ''

  useEffect(() => {
    if (!childPosition) return
    let cancelled = false
    const latitudePadding = 0.012
    const longitudePadding = 0.015
    listFacilities({
      swLat: childPosition.lat - latitudePadding,
      swLng: childPosition.lng - longitudePadding,
      neLat: childPosition.lat + latitudePadding,
      neLng: childPosition.lng + longitudePadding,
    })
      .then((facilities) => {
        if (!cancelled) setNearbyFacilities(facilities)
      })
      .catch(() => {
        if (!cancelled) setNearbyFacilities([])
      })
    return () => {
      cancelled = true
    }
    // 좌표가 약 100m 이상 달라졌을 때만 주변 시설과 주소를 다시 조회합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childAreaKey])

  const childMarkerImage = childMotionImage(childHeading, isChildMoving)

  const childLocationLabel = useMemo(() => {
    if (!childPosition) return '위치를 확인하고 있어요.'
    const containingSafeZone = safeZones.find(
      (zone) =>
        movementBetween(childPosition, {
          lat: zone.centerLat,
          lng: zone.centerLon,
        }).distance <= zone.radiusM,
    )
    if (containingSafeZone)
      return `${containingSafeZone.name} 안전구역에 있어요.`

    const nearestSchoolZone = nearbyFacilities
      .filter((facility) => facility.type === 'SCHOOL_ZONE' && facility.name)
      .map((facility) => ({
        facility,
        distance: movementBetween(childPosition, {
          lat: facility.lat,
          lng: facility.lng,
        }).distance,
      }))
      .filter(({ facility, distance }) => distance <= (facility.radiusM ?? 300))
      .sort((a, b) => a.distance - b.distance)[0]?.facility

    if (nearestSchoolZone) return `${nearestSchoolZone.name} 주변에 있어요.`

    const nearestSafeZone = safeZones
      .map((zone) => ({
        zone,
        distance: Math.max(
          0,
          movementBetween(childPosition, {
            lat: zone.centerLat,
            lng: zone.centerLon,
          }).distance - zone.radiusM,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0]

    if (nearestSafeZone)
      return `${nearestSafeZone.zone.name}에서 ${formatDistance(Math.round(nearestSafeZone.distance))} 떨어져 있어요.`
    return '등록된 안전구역에 없어요.'
  }, [childPosition, nearbyFacilities, safeZones])

  const findMyPosition = (moveMap = true) => {
    if (!navigator.geolocation) {
      setError('이 기기에서는 현재 위치를 사용할 수 없습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude }
        setMyPosition(position)
        if (moveMap) setMapCenter(position)
        setError(null)
      },
      () => setError('현재 위치 권한을 허용해 주세요.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    // 처음에는 지도 중심을 움직이지 않고 보호자의 위치만 준비합니다.
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        setMyPosition({ lat: coords.latitude, lng: coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    if (!selectedCategory || !mapBounds) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setError(null)
    searchPlacesInBounds(selectedCategory, mapBounds)
      .then((result) => {
        if (!cancelled) setPlaces(result)
      })
      .catch((searchError: unknown) => {
        if (!cancelled)
          setError(
            searchError instanceof Error
              ? searchError.message
              : '장소를 검색하지 못했습니다.',
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mapBounds, selectedCategory])

  const markers = useMemo<KakaoMapMarker[]>(() => {
    const result: KakaoMapMarker[] = []
    if (!isChild) {
      result.push(
        ...safeZones.map((zone) => ({
          id: `safe-zone-${zone.id}`,
          position: { lat: zone.centerLat, lng: zone.centerLon },
          imageUrl: homeMarkerIcon,
          imageSize: { width: 45, height: 55 },
        })),
      )
      result.push(
        ...places.map((place) => ({ id: place.id, position: place.position })),
      )
    }
    if (!isChild && myPosition)
      result.push({
        id: 'me',
        position: myPosition,
        imageUrl: homeMyLocationIcon,
        imageSize: { width: 44, height: 44 },
      })
    return result
  }, [isChild, myPosition, places, safeZones])

  const closeCategory = () => {
    setSelectedCategory(null)
    setPlaces([])
    setIsSheetExpanded(false)
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white font-sans text-neutral-900">
      <header className="relative z-30 bg-white px-4 pb-2 pt-4 shadow-sm">
        <div className="flex h-10 items-center justify-between">
          <img src={headerLogo} alt="아이봄" className="h-[34px] w-auto" />
          <div className="flex items-center gap-4">
            {!isChild && <PhoneCallButton />}
            <NotificationButton />
          </div>
        </div>
      </header>

      {!isChild && (
        <div className="relative z-30 h-0 w-full">
          <div className="no-scrollbar absolute inset-x-0 top-2 flex gap-1.5 overflow-x-auto px-4 py-2 pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  if (selectedCategory === category) closeCategory()
                  else {
                    setSelectedCategory(category)
                  }
                }}
                className={`shrink-0 rounded-full border px-3 py-[7px] text-[11px] shadow-sm transition-colors ${selectedCategory === category ? 'border-main-yellow bg-main-yellow font-semibold text-white' : 'border-neutral-300 bg-sub-cream text-neutral-900'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="relative min-h-0 flex-1">
        {mapCenter && childPosition ? (
          <KakaoMap
            center={mapCenter}
            level={1}
            markers={markers}
            trackedMarker={{
              position: childPosition,
              imageUrl: childMarkerImage,
              heading: childHeading,
              moving: isChildMoving,
            }}
            circles={safeZones.map((zone) => ({
              center: { lat: zone.centerLat, lng: zone.centerLon },
              radius: zone.radiusM,
              strokeColor: '#3F82EF',
              strokeOpacity: 0.9,
              strokeStyle: 'solid',
              fillColor: '#7DD3FC',
              fillOpacity: 0.2,
            }))}
            onBoundsChange={setMapBounds}
          />
        ) : (
          <div className="grid h-full place-items-center bg-slate-50 text-xs text-slate-400">
            자녀 위치를 불러오고 있어요.
          </div>
        )}

        {!isChild && (
          <div className="absolute left-3 top-20 z-10 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => childPosition && setMapCenter(childPosition)}
              className="flex flex-col items-center gap-1 text-[11px] font-medium"
            >
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#fff8d9] shadow-md">
                <img
                  src={homeChildAvatar}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              </span>
              아이 위치
            </button>
            <button
              type="button"
              onClick={() => findMyPosition()}
              className="flex flex-col items-center gap-1 text-[11px] font-medium"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-white shadow-md">
                <img src={homeMyLocationIcon} alt="" className="h-9 w-9" />
              </span>
              내 위치
            </button>
          </div>
        )}

        {error && (
          <p className="absolute left-1/2 top-14 z-20 w-max max-w-[80%] -translate-x-1/2 rounded-full bg-red-50 px-4 py-2 text-center text-[11px] text-red-600 shadow">
            {error}
          </p>
        )}

        {!isChild && !selectedCategory && (
          <section className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-sub-mint bg-sub-cream/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff4c7]">
                <img
                  src={homeChildAvatar}
                  alt="자녀"
                  className="h-10 w-10 object-contain"
                />
              </span>
              <div className="min-w-0">
                <p className="text-xs">
                  <b>{childName} 어린이는 지금</b>
                </p>
                <p className="mt-0.5 text-sm font-bold">{childLocationLabel}</p>
                <p className="mt-1 text-[9px] text-slate-500">
                  {formatUpdatedAt(childUpdatedAt)} · GPS
                </p>
                <button
                  type="button"
                  className={`mt-1 text-left text-xs font-semibold ${isChildMoving ? 'text-sub-leaf' : 'text-neutral-500'}`}
                >
                  {isChildMoving
                    ? '현재 이동 중입니다.'
                    : '현재 위치에 머물고 있습니다.'}
                </button>
              </div>
            </div>
          </section>
        )}

        {!isChild && selectedCategory && (
          <section
            className={`absolute inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,.12)] transition-[height] duration-300 ${isSheetExpanded ? 'h-[88%]' : 'h-[45%]'}`}
          >
            <div className="shrink-0 bg-white">
              <button
                type="button"
                aria-label={
                  isSheetExpanded ? '장소 목록 축소' : '장소 목록 확대'
                }
                className="flex h-7 w-full touch-none items-center justify-center"
                onPointerDown={(event) => {
                  sheetPointerY.current = event.clientY
                }}
                onPointerUp={(event) => {
                  if (sheetPointerY.current !== null) {
                    const distance = event.clientY - sheetPointerY.current
                    if (distance < -30) setIsSheetExpanded(true)
                    else if (distance > 30) setIsSheetExpanded(false)
                    else setIsSheetExpanded((expanded) => !expanded)
                  }
                  sheetPointerY.current = null
                }}
              >
                <span className="h-1 w-10 rounded-full bg-slate-200" />
              </button>
              <div className="flex items-center border-b px-4 py-2.5">
                <button
                  type="button"
                  onClick={closeCategory}
                  aria-label="뒤로가기"
                  className="mr-4 text-xl text-slate-500"
                >
                  ‹
                </button>
                <h2 className="text-sm font-bold">{selectedCategory}</h2>
                <button
                  type="button"
                  onClick={closeCategory}
                  aria-label="닫기"
                  className="ml-auto text-xl text-slate-500"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {isLoading && (
                <p className="py-7 text-center text-xs text-slate-400">
                  장소를 찾고 있어요...
                </p>
              )}
              {!isLoading && !error && places.length === 0 && (
                <p className="py-7 text-center text-xs text-slate-400">
                  검색 결과가 없습니다.
                </p>
              )}
              {!isLoading &&
                places.map((place) => (
                  <a
                    key={place.id}
                    href={place.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border-b px-5 py-3"
                  >
                    <p className="text-xs font-bold">
                      {place.name}
                      <span className="ml-1.5 font-normal text-point-blue">
                        {formatDistance(place.distanceMeters)}
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {place.address}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {place.category}
                      {place.phone ? ` · ${place.phone}` : ''}
                    </p>
                  </a>
                ))}
            </div>
          </section>
        )}
      </section>
      <BottomNavigation />
    </main>
  )
}
