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
      relayout(): void
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
    }
    function load(callback: () => void): void
  }
  interface Window {
    kakao?: { maps: typeof kakao.maps }
  }
}

export type KakaoMapCoordinate = { lat: number; lng: number }

export type KakaoMapMarker = {
  id?: string | number
  position: KakaoMapCoordinate
  imageUrl?: string
  imageSize?: { width: number; height: number }
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
}

type KakaoMaps = typeof kakao.maps

let sdkPromise: Promise<KakaoMaps> | undefined

function loadKakaoMaps(): Promise<KakaoMaps> {
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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
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
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const initialMapOptionsRef = useRef({ center, level })
  const onClickRef = useRef(onClick)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

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
        mapRef.current = map
        setIsLoaded(true)

        maps.event.addListener(map, 'click', (event) => {
          onClickRef.current?.({
            lat: event.latLng.getLat(),
            lng: event.latLng.getLng(),
          })
        })
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
    const markerInstances = markers.map(({ position, imageUrl, imageSize }) => {
      const image = imageUrl
        ? new maps.MarkerImage(
            imageUrl,
            new maps.Size(imageSize?.width ?? 32, imageSize?.height ?? 32),
          )
        : undefined
      return new maps.Marker({
        map,
        position: new maps.LatLng(position.lat, position.lng),
        image,
      })
    })
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
  }, [isLoaded, center, level, markers, circle])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
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
