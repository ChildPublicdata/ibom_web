import { useEffect, useRef, useState } from 'react'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }
    class Size {
      constructor(width: number, height: number)
    }
    class MarkerImage {
      constructor(src: string, size: Size)
    }
    class Map {
      constructor(
        container: HTMLElement,
        options: { center: LatLng; level: number },
      )
      setCenter(center: LatLng): void
      setLevel(level: number): void
      setDraggable(draggable: boolean): void
      setZoomable(zoomable: boolean): void
      relayout(): void
      getBounds(): LatLngBounds
    }
    class LatLngBounds {
      constructor(southWest: LatLng, northEast: LatLng)
      getSouthWest(): LatLng
      getNorthEast(): LatLng
    }
    // The Kakao SDK exposes its place service through this global namespace.
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace services {
      type PlacesSearchResult = Array<{
        id: string
        place_name: string
        category_name: string
        phone: string
        address_name: string
        road_address_name: string
        x: string
        y: string
        distance: string
        place_url: string
      }>
      type StatusValue = 'OK' | 'ZERO_RESULT' | 'ERROR'
      const Status: {
        OK: StatusValue
        ZERO_RESULT: StatusValue
        ERROR: StatusValue
      }
      const SortBy: { DISTANCE: string; ACCURACY: string }
      class Places {
        keywordSearch(
          keyword: string,
          callback: (result: PlacesSearchResult, status: StatusValue) => void,
          options?: {
            location?: LatLng
            radius?: number
            sort?: string
            bounds?: LatLngBounds
          },
        ): void
        categorySearch(
          code: string,
          callback: (result: PlacesSearchResult, status: StatusValue) => void,
          options: {
            location?: LatLng
            radius?: number
            sort?: string
            bounds?: LatLngBounds
          },
        ): void
      }
    }
    class Marker {
      constructor(options: { map: Map; position: LatLng; image?: MarkerImage })
      setMap(map: Map | null): void
    }
    class Circle {
      constructor(options: {
        map: Map
        center: LatLng
        radius: number
        strokeWeight: number
        strokeColor: string
        strokeOpacity: number
        strokeStyle: string
        fillColor: string
        fillOpacity: number
      })
      setMap(map: Map | null): void
    }
    type MouseEvent = { latLng: LatLng }
    const event: {
      addListener(
        target: Map,
        type: 'click',
        listener: (event: MouseEvent) => void,
      ): void
      addListener(target: Map, type: 'idle', listener: () => void): void
      addListener(target: Marker, type: 'click', listener: () => void): void
    }
    function load(callback: () => void): void
  }
  interface Window {
    kakao?: { maps: typeof kakao.maps }
  }
}

export type KakaoMapCoordinate = { lat: number; lng: number }
export type KakaoMapBounds = {
  southWest: KakaoMapCoordinate
  northEast: KakaoMapCoordinate
}

export type KakaoMapMarker = {
  id?: string | number
  position: KakaoMapCoordinate
  imageUrl?: string
  imageSize?: { width: number; height: number }
  onClick?: () => void
}

export type KakaoMapCircle = {
  center: KakaoMapCoordinate
  radius: number
  strokeColor?: string
  strokeOpacity?: number
  strokeStyle?: string
  fillColor?: string
  fillOpacity?: number
}

type KakaoMapProps = {
  center: KakaoMapCoordinate
  level?: number
  markers?: KakaoMapMarker[]
  circle?: KakaoMapCircle
  onClick?: (coordinate: KakaoMapCoordinate) => void
  onBoundsChange?: (bounds: KakaoMapBounds) => void
}

type KakaoMaps = typeof kakao.maps

let sdkPromise: Promise<KakaoMaps> | undefined

// eslint-disable-next-line react-refresh/only-export-components
export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (window.kakao?.maps) {
    return new Promise((resolve) =>
      window.kakao?.maps.load(() => resolve(window.kakao!.maps)),
    )
  }
  if (sdkPromise) return sdkPromise

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
  if (!appKey)
    return Promise.reject(
      new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'),
    )

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
    script.onload = () =>
      window.kakao!.maps.load(() => resolve(window.kakao!.maps))
    script.onerror = () =>
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
  return sdkPromise
}

export function KakaoMap({
  center,
  level = 3,
  markers = [],
  circle,
  onClick,
  onBoundsChange,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const initialMapOptionsRef = useRef({ center, level })
  const onClickRef = useRef(onClick)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
  }, [onBoundsChange])

  useEffect(() => {
    let isUnmounted = false
    let resizeObserver: ResizeObserver | undefined

    loadKakaoMaps()
      .then((maps) => {
        if (isUnmounted || !containerRef.current) return
        const { center: initialCenter, level: initialLevel } =
          initialMapOptionsRef.current
        const map = new maps.Map(containerRef.current, {
          center: new maps.LatLng(initialCenter.lat, initialCenter.lng),
          level: initialLevel,
        })
        map.setDraggable(true)
        map.setZoomable(true)
        mapRef.current = map
        setIsLoaded(true)

        maps.event.addListener(map, 'click', (event) => {
          onClickRef.current?.({
            lat: event.latLng.getLat(),
            lng: event.latLng.getLng(),
          })
        })
        const notifyBounds = () => {
          const bounds = map.getBounds()
          const southWest = bounds.getSouthWest()
          const northEast = bounds.getNorthEast()
          onBoundsChangeRef.current?.({
            southWest: { lat: southWest.getLat(), lng: southWest.getLng() },
            northEast: { lat: northEast.getLat(), lng: northEast.getLng() },
          })
        }
        maps.event.addListener(map, 'idle', notifyBounds)
        notifyBounds()
        resizeObserver = new ResizeObserver(() => map.relayout())
        resizeObserver.observe(containerRef.current)
      })
      .catch((loadError: unknown) => {
        if (!isUnmounted)
          setError(
            loadError instanceof Error
              ? loadError.message
              : '지도를 불러오지 못했습니다.',
          )
      })

    return () => {
      isUnmounted = true
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const maps = window.kakao?.maps
    if (!map || !maps) return

    map.setCenter(new maps.LatLng(center.lat, center.lng))
    map.setLevel(level)
  }, [isLoaded, center, level])

  useEffect(() => {
    const map = mapRef.current
    const maps = window.kakao?.maps
    if (!map || !maps) return

    const markerInstances = markers.map(
      ({ position, imageUrl, imageSize, onClick: onMarkerClick }) => {
        const image = imageUrl
          ? new maps.MarkerImage(
              imageUrl,
              new maps.Size(imageSize?.width ?? 32, imageSize?.height ?? 32),
            )
          : undefined
        const marker = new maps.Marker({
          map,
          position: new maps.LatLng(position.lat, position.lng),
          image,
        })
        if (onMarkerClick)
          maps.event.addListener(marker, 'click', onMarkerClick)
        return marker
      },
    )
    const circleInstance =
      circle &&
      new maps.Circle({
        map,
        center: new maps.LatLng(circle.center.lat, circle.center.lng),
        radius: circle.radius,
        strokeWeight: 2,
        strokeColor: circle.strokeColor ?? '#2563eb',
        strokeOpacity: circle.strokeOpacity ?? 0.8,
        strokeStyle: circle.strokeStyle ?? 'solid',
        fillColor: circle.fillColor ?? '#60a5fa',
        fillOpacity: circle.fillOpacity ?? 0.2,
      })

    return () => {
      markerInstances.forEach((marker) => marker.setMap(null))
      circleInstance?.setMap(null)
    }
  }, [isLoaded, markers, circle])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="pointer-events-auto h-full w-full touch-none"
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-100 text-sm text-slate-600">
          지도를 불러오는 중입니다...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-100 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
