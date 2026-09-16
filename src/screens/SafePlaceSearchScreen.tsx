import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import headerLogo from '@/assets/header-logo.svg'
import searchIcon from '@/assets/icons/search.svg'
import { PhoneCallButton } from '@/components/CallModal'
import { NotificationButton } from '@/components/NotificationButton'
import { searchPlacesByKeyword, type KakaoPlace } from '@/lib/kakaoPlaces'
import { listSafePlaces, type SafePlace } from '@/lib/safetyApi'
import { useAppStore } from '@/store/useAppStore'

export function SafePlaceSearchScreen() {
  const navigate = useNavigate()
  const setSafePlaceDraft = useAppStore((state) => state.setSafePlaceDraft)
  const setSafePlacePosition = useAppStore(
    (state) => state.setSafePlacePosition,
  )
  const [query, setQuery] = useState('')
  const [savedPlaces, setSavedPlaces] = useState<SafePlace[]>([])
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listSafePlaces()
      .then(setSavedPlaces)
      .catch(() => setError('등록한 장소를 불러오지 못했습니다.'))
  }, [])

  useEffect(() => {
    if (!query.trim()) return
    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setError('')
      searchPlacesByKeyword(query)
        .then(setSearchResults)
        .catch(() => setError('장소를 검색하지 못했습니다.'))
        .finally(() => setIsLoading(false))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const choosePlace = (place: {
    name: string
    address: string
    position: { lat: number; lng: number }
    saved: boolean
  }) => {
    if (place.saved) {
      setSafePlacePosition(place.position)
      navigate('/safe-zone-setup')
      return
    }
    setSafePlaceDraft(place)
    navigate('/safe-place-setup')
  }

  const rows = query.trim()
    ? searchResults.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        position: place.position,
        saved: false,
      }))
    : savedPlaces.map((place) => ({
        id: String(place.id),
        name: place.name,
        address: place.address,
        position: { lat: place.lat, lng: place.lon },
        saved: true,
      }))

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white text-[#202020]">
      <header className="border-b border-slate-100 bg-white px-5 pb-4 pt-5">
        <div className="flex h-10 items-center justify-between">
          <img src={headerLogo} alt="아이봄" className="h-[34px] w-auto" />
          <div className="flex items-center gap-5">
            <PhoneCallButton />
            <NotificationButton />
          </div>
        </div>
        <div className="mt-3 flex items-center">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="text-3xl font-light leading-none text-slate-600"
          >
            ‹
          </button>
          <h1 className="ml-6 text-xl font-bold tracking-[-0.04em]">
            안전장소
          </h1>
        </div>
        <label className="mt-4 flex h-12 items-center rounded-full bg-[#f5f5f5] px-5">
          <img src={searchIcon} alt="" className="mr-2 h-4 w-4 opacity-50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            type="search"
            placeholder="장소, 시설, 주소 검색"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>
      </header>
      <section className="flex-1 px-5">
        {!query && savedPlaces.length > 0 && (
          <p className="pt-4 text-xs text-slate-400">등록한 안전장소</p>
        )}
        {rows.map((place) => (
          <button
            key={place.id}
            type="button"
            className="flex min-h-16 w-full items-center border-b border-slate-200 text-left"
            onClick={() => choosePlace(place)}
          >
            <span className="mr-4 h-8 w-8 shrink-0 rounded-full bg-[#f5f5f5]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{place.name}</span>
              <span className="mt-1 block truncate text-[10px] text-slate-400">
                {place.address}
              </span>
            </span>
          </button>
        ))}
        {isLoading && (
          <p className="pt-16 text-center text-sm text-slate-400">검색 중...</p>
        )}
        {!isLoading && query && rows.length === 0 && !error && (
          <p className="pt-16 text-center text-sm text-slate-400">
            검색 결과가 없습니다.
          </p>
        )}
        {error && (
          <p className="pt-16 text-center text-sm text-red-400">{error}</p>
        )}
      </section>
    </main>
  )
}
