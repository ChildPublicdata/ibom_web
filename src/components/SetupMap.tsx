import { useEffect, useState } from 'react'
import currentLocationIcon from '@/assets/icons/current-location.svg'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import placePinIcon from '@/assets/icons/place-pin.svg'
import { KakaoMap } from '@/components/KakaoMap'
import type { KakaoMapCoordinate, KakaoMapMarker } from '@/components/KakaoMap'

type SetupMapProps = {
  circleRadius?: number
  selectedPosition?: KakaoMapCoordinate
  onClick?: (position: KakaoMapCoordinate) => void
  showHome?: boolean
  showPin?: boolean
}

const fallbackLocation = { lat: 37.5665, lng: 126.978 }

export function SetupMap({
  circleRadius,
  selectedPosition,
  onClick,
  showHome,
  showPin,
}: SetupMapProps) {
  const [currentLocation, setCurrentLocation] = useState(fallbackLocation)
  const mapCenter = selectedPosition ?? currentLocation

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        setCurrentLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }, [])

  const markers: KakaoMapMarker[] = [
    {
      id: 'current-location',
      position: currentLocation,
      imageUrl: currentLocationIcon,
      imageSize: { width: 42, height: 42 },
    },
  ]

  if (showPin && selectedPosition) {
    markers.push({
      id: 'selected-place',
      position: selectedPosition,
      imageUrl: placePinIcon,
      imageSize: { width: 52, height: 73 },
    })
  }

  if (showHome) {
    markers.push({
      id: 'safe-place-home',
      position: mapCenter,
      imageUrl: homeMarkerIcon,
      imageSize: { width: 52, height: 64 },
    })
  }

  return (
    <div className="h-full w-full">
      <KakaoMap
        center={mapCenter}
        circle={
          circleRadius
            ? {
                center: mapCenter,
                radius: circleRadius,
                strokeColor: '#ff9800',
                strokeOpacity: 0.9,
                strokeStyle: 'shortdash',
                fillColor: '#fff3cb',
                fillOpacity: 0.72,
              }
            : undefined
        }
        markers={markers}
        onClick={onClick}
      />
    </div>
  )
}
