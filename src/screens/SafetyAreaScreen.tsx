import { useEffect, useRef, useState } from 'react'
import headerLogo from '@/assets/header-logo.svg'
import childStationary from '@/assets/child-motion/child-stationary.svg'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import homeMyLocationIcon from '@/assets/icons/home-my-location.svg'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import cctvIcon from '@/assets/icons/cctv.svg'
import riskAreaMarker from '@/assets/icons/risk-area-marker.svg'
import safeAreaStatusIcon from '@/assets/icons/safe-area-status.svg'
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
  checkSafeZones,
  listCctv,
  listFacilities,
  listRiskZones,
  listSafeZones,
  listSafetyBells,
  listTrafficAccidents,
  type Cctv,
  type Facility,
  type RiskZone,
  type SafeZone,
  type SafetyBell,
  type TrafficAccident,
} from '@/lib/safetyApi'
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
import { useAppStore } from '@/store/useAppStore'

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

function distanceInMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadius = 6_371_000
  const toRadians = (degree: number) => (degree * Math.PI) / 180
  const latitudeDelta = toRadians(to.lat - from.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const startLatitude = toRadians(from.lat)
  const endLatitude = toRadians(to.lat)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return (
    earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

export function SafetyAreaScreen() {
  const [selectedRisk, setSelectedRisk] = useState<RiskZone | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceSearchKind | null>(null)
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [isPlaceLoading, setIsPlaceLoading] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)
  const [childPosition, setChildPosition] = useState<KakaoMapCoordinate | null>(
    null,
  )
  const [mapCenter, setMapCenter] = useState<KakaoMapCoordinate | null>(null)
  const [mapBounds, setMapBounds] = useState<KakaoMapBounds | null>(null)
  const [riskZones, setRiskZones] = useState<RiskZone[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [cctv, setCctv] = useState<Cctv[]>([])
  const [safetyBells, setSafetyBells] = useState<SafetyBell[]>([])
  const [trafficAccidents, setTrafficAccidents] = useState<TrafficAccident[]>(
    [],
  )
  const [isChildInside, setIsChildInside] = useState<boolean | null>(null)
  const sheetPointerY = useRef<number | null>(null)
  const dismissedAutomaticRisks = useRef(new Set<string>())
  const selectedChildId = useAppStore((state) => state.selectedChildId)
  const setSelectedChildId = useAppStore((state) => state.setSelectedChildId)

  useEffect(() => {
    Promise.all([
      listSafeZones(),
      listCctv(),
      listSafetyBells(),
      listTrafficAccidents(),
    ])
      .then(([zones, cctvPage, bellPage, accidentPage]) => {
        setSafeZones(zones)
        setCctv(cctvPage.content)
        setSafetyBells(bellPage.content)
        setTrafficAccidents(accidentPage.content)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const session = getAuthSession()
    if (!session) return

    if (session.role === 'CHILD') {
      if (!navigator.geolocation) return
      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const position = { lat: coords.latitude, lng: coords.longitude }
          setChildPosition(position)
          setMapCenter((current) => current ?? position)
          reportChildLocation(position.lat, position.lng).catch(() => undefined)
        },
        () => setPlaceError('현재 위치 권한을 허용해 주세요.'),
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
        const location = await getChildLocation(selected.childId)
        if (cancelled) return
        const position = { lat: location.lat, lng: location.lon }
        setChildPosition(position)
        setMapCenter((current) => current ?? position)
      } catch (locationError) {
        if (!cancelled)
          setPlaceError(
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
    if (!childPosition) return
    checkSafeZones(childPosition.lat, childPosition.lng)
      .then((result) => setIsChildInside(result.inside))
      .catch(() => setIsChildInside(null))
  }, [childPosition])

  useEffect(() => {
    if (!mapBounds) return
    const bounds = {
      swLat: mapBounds.southWest.lat,
      swLng: mapBounds.southWest.lng,
      neLat: mapBounds.northEast.lat,
      neLng: mapBounds.northEast.lng,
    }
    Promise.all([listRiskZones(bounds), listFacilities(bounds)])
      .then(([zones, foundFacilities]) => {
        setRiskZones(zones)
        setFacilities(foundFacilities)
      })
      .catch(() => {
        setRiskZones([])
        setFacilities([])
      })
  }, [mapBounds])

  useEffect(() => {
    if (!childPosition || selectedRisk || selectedCategory) return
    const containingZone = riskZones.find(
      (zone) =>
        !dismissedAutomaticRisks.current.has(zone.zoneId) &&
        distanceInMeters(childPosition, { lat: zone.lat, lng: zone.lng }) <=
          zone.radiusM,
    )
    if (!containingZone) return
    // 아이가 사고 다발 구역 안에 있으면 별도 마커 클릭 없이 상세창을 표시합니다.
    setSelectedRisk(containingZone)
  }, [childPosition, riskZones, selectedCategory, selectedRisk])

  useEffect(() => {
    if (!selectedCategory || !mapBounds) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaceLoading(true)
    setPlaceError('')
    searchPlacesInBounds(selectedCategory, mapBounds)
      .then((result) => {
        if (!cancelled) setPlaces(result)
      })
      .catch((searchError) => {
        if (!cancelled) {
          setPlaces([])
          setPlaceError(
            searchError instanceof Error
              ? searchError.message
              : '장소를 검색하지 못했습니다.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsPlaceLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mapBounds, selectedCategory])

  const isVisible = (lat: number, lng: number) =>
    !mapBounds ||
    (lat >= mapBounds.southWest.lat &&
      lat <= mapBounds.northEast.lat &&
      lng >= mapBounds.southWest.lng &&
      lng <= mapBounds.northEast.lng)

  const visibleAccidentZones: RiskZone[] = trafficAccidents
    .filter((item) => isVisible(item.lat, item.lon))
    .map((item) => ({
      zoneId: `accident-${item.id}`,
      type: item.accidentType,
      lat: item.lat,
      lng: item.lon,
      radiusM: 100,
      riskScore: item.accidentCount,
      grade: '사고다발지역',
      epdo: 0,
      accidents: item.accidentCount,
      fatalities: item.deathCount,
      serious: item.seriousInjuryCount,
      minor: item.minorInjuryCount,
      district: '',
      roadName: item.locationName,
      roadType: item.accidentType,
      topAccidentType: item.accidentType,
    }))
  const visibleRiskZones =
    riskZones.length > 0 ? riskZones : visibleAccidentZones

  const markers: KakaoMapMarker[] = [
    ...(childPosition
      ? [
          {
            id: 'child',
            position: childPosition,
            imageUrl: childStationary,
            imageSize: { width: 78, height: 77 },
          },
        ]
      : []),
    ...safeZones.map((zone) => ({
      id: `safe-${zone.id}`,
      position: { lat: zone.centerLat, lng: zone.centerLon },
      imageUrl: homeMarkerIcon,
      imageSize: { width: 45, height: 55 },
    })),
    ...visibleRiskZones.map((zone) => ({
      id: zone.zoneId,
      position: { lat: zone.lat, lng: zone.lng },
      imageUrl: riskAreaMarker,
      imageSize: { width: 52, height: 52 },
      onClick: () => {
        setSelectedCategory(null)
        setPlaces([])
        setSelectedRisk(zone)
      },
    })),
    ...facilities.map((facility) => ({
      id: facility.facilityId,
      position: { lat: facility.lat, lng: facility.lng },
      imageUrl: facility.type === 'CCTV' ? cctvIcon : undefined,
      imageSize:
        facility.type === 'CCTV' ? { width: 36, height: 36 } : undefined,
    })),
    ...(facilities.length === 0
      ? cctv
          .filter((item) => isVisible(item.lat, item.lon))
          .map((item) => ({
            id: `cctv-${item.id}`,
            position: { lat: item.lat, lng: item.lon },
            imageUrl: cctvIcon,
            imageSize: { width: 36, height: 36 },
          }))
      : []),
    ...safetyBells
      .filter((item) => isVisible(item.lat, item.lon))
      .map((item) => ({
        id: `bell-${item.id}`,
        position: { lat: item.lat, lng: item.lon },
      })),
    ...places.map((place) => ({
      id: `place-${place.id}`,
      position: place.position,
    })),
  ]

  const closeCategory = () => {
    setSelectedCategory(null)
    setPlaces([])
    setPlaceError('')
    setIsSheetExpanded(false)
  }

  const accidentItems = selectedRisk
    ? [
        {
          type: selectedRisk.topAccidentType || '전체 교통사고',
          count: selectedRisk.accidents,
        },
        { type: '중상 사고', count: selectedRisk.serious },
        { type: '경상 사고', count: selectedRisk.minor },
        { type: '사망 사고', count: selectedRisk.fatalities },
      ]
    : []

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white font-sans text-neutral-900">
      <header className="relative z-30 bg-white px-4 pb-2 pt-4 shadow-sm">
        <div className="flex h-10 items-center justify-between">
          <img src={headerLogo} alt="아이봄" className="h-[34px] w-auto" />
          <div className="flex items-center gap-4">
            <PhoneCallButton />
            <NotificationButton />
          </div>
        </div>
      </header>

      <div className="relative z-30 h-0 w-full">
        <div className="no-scrollbar absolute inset-x-0 top-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                if (selectedCategory === category) closeCategory()
                else {
                  setSelectedRisk(null)
                  setIsSheetExpanded(false)
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

      <section className="relative min-h-0 flex-1">
        {mapCenter ? (
          <KakaoMap
            center={mapCenter}
            level={2}
            markers={markers}
            onBoundsChange={setMapBounds}
            circle={
              selectedRisk
                ? {
                    center: { lat: selectedRisk.lat, lng: selectedRisk.lng },
                    radius: selectedRisk.radiusM,
                    strokeColor: '#FFD54F',
                    strokeOpacity: 1,
                    fillColor: '#FFD54F',
                    fillOpacity: 0.38,
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid h-full place-items-center bg-slate-50 text-xs text-slate-400">
            자녀 위치를 불러오고 있어요.
          </div>
        )}

        <div className="absolute left-3 top-20 z-10 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => childPosition && setMapCenter(childPosition)}
            className="flex flex-col items-center gap-1 text-[11px] font-medium"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-sub-cream shadow-md">
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
            className="flex flex-col items-center gap-1 text-[11px] font-medium"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-white shadow-md">
              <img src={homeMyLocationIcon} alt="" className="h-9 w-9" />
            </span>
            내 위치
          </button>
        </div>

        {!selectedRisk && !selectedCategory && (
          <section
            className={`absolute bottom-4 left-4 right-4 z-20 rounded-2xl px-4 py-3 shadow-lg ${isChildInside === false ? 'bg-main-orange' : 'bg-main-yellow'}`}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sub-leaf">
                <img src={safeAreaStatusIcon} alt="" className="h-8 w-8" />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  {isChildInside === null
                    ? '안전구역 상태를 확인하고 있어요.'
                    : isChildInside
                      ? '우리 아이는 지금 안전구역에 있어요.'
                      : '우리 아이가 안전구역 밖에 있어요.'}
                </p>
                <p className="mt-1 text-[9px]">2026.08.25 · 최신 위치 · GPS</p>
              </div>
            </div>
          </section>
        )}

        {selectedRisk && (
          <section
            className={`absolute inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,.12)] transition-[height] duration-300 ${isSheetExpanded ? 'h-[88%]' : 'h-[45%]'}`}
          >
            <button
              type="button"
              aria-label={isSheetExpanded ? '사고 정보 축소' : '사고 정보 확대'}
              className="flex h-8 w-full shrink-0 touch-none items-center justify-center"
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
              <span className="h-1 w-10 rounded-full bg-neutral-300" />
            </button>

            <div className="flex shrink-0 items-center gap-4 border-b px-6 pb-4 pt-2">
              <img src={riskAreaMarker} alt="위험" className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  이 곳은 사고 다발 구역입니다.
                </p>
                <p className="mt-1 text-[10px] text-neutral-500">
                  위험도 {selectedRisk.riskScore} · {selectedRisk.grade}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  dismissedAutomaticRisks.current.add(selectedRisk.zoneId)
                  setSelectedRisk(null)
                  setIsSheetExpanded(false)
                }}
                aria-label="닫기"
                className="text-xl text-neutral-500"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
              {accidentItems.map((accident) => (
                <div
                  key={accident.type}
                  className="flex items-center justify-between border-b py-3 text-xs"
                >
                  <span>{accident.type}</span>
                  <span>
                    <b className="text-main-orange">{accident.count}</b>회
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedCategory && (
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
              {isPlaceLoading && (
                <p className="py-7 text-center text-xs text-slate-400">
                  장소를 찾고 있어요...
                </p>
              )}
              {!isPlaceLoading && placeError && (
                <p className="px-5 py-7 text-center text-xs text-red-500">
                  {placeError}
                </p>
              )}
              {!isPlaceLoading && !placeError && places.length === 0 && (
                <p className="py-7 text-center text-xs text-slate-400">
                  검색 결과가 없습니다.
                </p>
              )}
              {!isPlaceLoading &&
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
      <BottomNavigation active="safe-zone" />
    </main>
  )
}
