import {
  loadKakaoMaps,
  type KakaoMapBounds,
  type KakaoMapCoordinate,
} from '@/components/KakaoMap'

export type PlaceSearchKind =
  '소아과' | '병원' | '약국' | '경찰서' | '어린이보호구역'
export type KakaoPlace = {
  id: string
  name: string
  category: string
  address: string
  phone: string
  distanceMeters: number
  position: KakaoMapCoordinate
  url: string
}

const categoryCodes: Partial<Record<PlaceSearchKind, string>> = {
  병원: 'HP8',
  약국: 'PM9',
}

export async function searchPlacesInBounds(
  kind: PlaceSearchKind,
  visibleBounds: KakaoMapBounds,
): Promise<KakaoPlace[]> {
  const maps = await loadKakaoMaps()
  const places = new maps.services.Places()
  const bounds = new maps.LatLngBounds(
    new maps.LatLng(visibleBounds.southWest.lat, visibleBounds.southWest.lng),
    new maps.LatLng(visibleBounds.northEast.lat, visibleBounds.northEast.lng),
  )
  const result = await new Promise<kakao.maps.services.PlacesSearchResult>(
    (resolve, reject) => {
      const callback = (
        items: kakao.maps.services.PlacesSearchResult,
        status: kakao.maps.services.StatusValue,
      ) => {
        if (status === maps.services.Status.OK) resolve(items)
        else if (status === maps.services.Status.ZERO_RESULT) resolve([])
        else reject(new Error('장소 검색 중 오류가 발생했습니다.'))
      }
      const options = { bounds, sort: maps.services.SortBy.ACCURACY }
      const categoryCode = categoryCodes[kind]
      if (categoryCode) places.categorySearch(categoryCode, callback, options)
      else places.keywordSearch(kind, callback, options)
    },
  )
  return result.map((place) => ({
    id: place.id,
    name: place.place_name,
    category: place.category_name.split(' > ').at(-1) ?? kind,
    address: place.road_address_name || place.address_name,
    phone: place.phone,
    distanceMeters: Number(place.distance) || 0,
    position: { lat: Number(place.y), lng: Number(place.x) },
    url: place.place_url,
  }))
}
