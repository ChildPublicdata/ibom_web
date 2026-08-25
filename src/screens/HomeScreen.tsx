import { useEffect, useMemo, useRef, useState } from 'react'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import homeMyLocationIcon from '@/assets/icons/home-my-location.svg'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import notificationIcon from '@/assets/icons/notification.svg'
import phoneIcon from '@/assets/icons/phone.svg'
import childDown from '@/assets/child-motion/child-down.svg'
import childDownLeft from '@/assets/child-motion/child-down-left.svg'
import childDownRight from '@/assets/child-motion/child-down-right.svg'
import childStationary from '@/assets/child-motion/child-stationary.svg'
import childUp from '@/assets/child-motion/child-up.svg'
import childUpLeft from '@/assets/child-motion/child-up-left.svg'
import childUpRight from '@/assets/child-motion/child-up-right.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
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

// 자녀 위치 API 연결 전 기본 위치입니다. 이후 서버에서 받은 최신 좌표로 교체합니다.
const CHILD_POSITION = { lat: 36.325, lng: 127.4214 }
const SAFE_PLACE_POSITION = { lat: 36.3261, lng: 127.4199 }
const categories: PlaceSearchKind[] = [
  '소아과',
  '병원',
  '약국',
  '경찰서',
  '어린이보호구역',
]
const movingFrames = [
  childUp,
  childUpRight,
  childDownRight,
  childDown,
  childDownLeft,
  childUpLeft,
]

function formatDistance(meters: number) {
  return meters < 1000
    ? `${meters.toLocaleString()}m`
    : `${(meters / 1000).toFixed(1)}km`
}

export function HomeScreen() {
  const [mapCenter, setMapCenter] = useState<KakaoMapCoordinate>(CHILD_POSITION)
  const [myPosition, setMyPosition] = useState<KakaoMapCoordinate | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceSearchKind | null>(null)
  const [mapBounds, setMapBounds] = useState<KakaoMapBounds | null>(null)
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChildMoving, setIsChildMoving] = useState(false)
  const [motionFrame, setMotionFrame] = useState(0)
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)
  const sheetPointerY = useRef<number | null>(null)

  useEffect(() => {
    if (!isChildMoving) return
    const frameTimer = window.setInterval(
      () => setMotionFrame((frame) => (frame + 1) % movingFrames.length),
      900,
    )
    return () => window.clearInterval(frameTimer)
  }, [isChildMoving])

  const childMarkerImage = isChildMoving
    ? movingFrames[motionFrame]
    : childStationary

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
    const result: KakaoMapMarker[] = [
      {
        id: 'child',
        position: CHILD_POSITION,
        imageUrl: childMarkerImage,
        imageSize: { width: 78, height: 77 },
      },
      {
        id: 'school',
        position: SAFE_PLACE_POSITION,
        imageUrl: homeMarkerIcon,
        imageSize: { width: 45, height: 55 },
      },
      ...places.map((place) => ({ id: place.id, position: place.position })),
    ]
    if (myPosition)
      result.push({
        id: 'me',
        position: myPosition,
        imageUrl: homeMyLocationIcon,
        imageSize: { width: 44, height: 44 },
      })
    return result
  }, [childMarkerImage, myPosition, places])

  const closeCategory = () => {
    setSelectedCategory(null)
    setPlaces([])
    setIsSheetExpanded(false)
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white font-sans text-neutral-900">
      <header className="relative z-30 bg-white px-4 pb-2 pt-4 shadow-sm">
        <div className="flex h-10 items-center justify-between">
          <span className="text-xl tracking-[-0.04em]">LOGO</span>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="전화 걸기">
              <img src={phoneIcon} className="h-7 w-7" alt="" />
            </button>
            <button type="button" aria-label="알림">
              <img src={notificationIcon} className="h-7 w-7" alt="" />
            </button>
          </div>
        </div>
      </header>

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

      <section className="relative min-h-0 flex-1">
        <KakaoMap
          center={mapCenter}
          level={1}
          markers={markers}
          onBoundsChange={setMapBounds}
        />

        <div className="absolute left-3 top-20 z-10 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setMapCenter(CHILD_POSITION)}
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

        {error && (
          <p className="absolute left-1/2 top-14 z-20 w-max max-w-[80%] -translate-x-1/2 rounded-full bg-red-50 px-4 py-2 text-center text-[11px] text-red-600 shadow">
            {error}
          </p>
        )}

        {!selectedCategory && (
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
                  <b>우리 아이는 지금</b>
                </p>
                <p className="mt-0.5 text-sm font-bold">
                  보문초등학교 주변에 있어요.
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  2026.08.25 · 최신 위치 · GPS
                </p>
                <button
                  type="button"
                  onClick={() => setIsChildMoving((moving) => !moving)}
                  className={`mt-1 text-left text-xs font-semibold ${isChildMoving ? 'text-sub-leaf' : 'text-neutral-500'}`}
                  aria-label="자녀 이동 상태 이미지 미리보기 전환"
                >
                  {isChildMoving
                    ? '안심루트로 이동 중입니다.'
                    : '현재 위치에 머물고 있습니다.'}
                </button>
              </div>
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
