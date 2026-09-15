import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { KakaoMap } from '@/components/KakaoMap'
import { SetupHeader } from '@/components/SetupHeader'
import { deleteSafeZone, listSafeZones, type SafeZone } from '@/lib/safetyApi'

const ANYANG_CENTER = { lat: 37.3943, lng: 126.9568 }

export function SafePlacesScreen() {
  const navigate = useNavigate()
  const [zones, setZones] = useState<SafeZone[]>([])
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null)
  const [disabledZones, setDisabledZones] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listSafeZones()
      .then((result) => {
        if (!cancelled) setZones(result)
      })
      .catch((loadError) => {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : '안전장소를 불러오지 못했습니다.',
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const mapCenter = zones[0]
    ? { lat: zones[0].centerLat, lng: zones[0].centerLon }
    : ANYANG_CENTER
  const markers = useMemo(
    () =>
      zones.map((zone) => ({
        id: zone.id,
        position: { lat: zone.centerLat, lng: zone.centerLon },
        imageUrl: homeMarkerIcon,
        imageSize: { width: 48, height: 58 },
        onClick: () => setSelectedZone(zone),
      })),
    [zones],
  )

  const removeZone = async () => {
    if (!selectedZone) return
    if (!window.confirm(`‘${selectedZone.name}’을 삭제할까요?`)) return
    try {
      await deleteSafeZone(selectedZone.id)
      setZones((current) =>
        current.filter((zone) => zone.id !== selectedZone.id),
      )
      setSelectedZone(null)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : '안전장소를 삭제하지 못했습니다.',
      )
    }
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white text-neutral-900">
      <SetupHeader
        title="안전장소"
        description="등록한 안전장소를 관리하세요."
      />
      <section className="relative min-h-0 flex-1">
        <KakaoMap
          center={mapCenter}
          level={3}
          markers={markers}
          circles={zones.map((zone) => ({
            center: { lat: zone.centerLat, lng: zone.centerLon },
            radius: zone.radiusM,
            strokeColor: '#74DCFF',
            fillColor: '#74DCFF',
            fillOpacity: 0.2,
          }))}
        />
      </section>

      <section className="z-20 max-h-[245px] shrink-0 bg-white px-4 pb-3 pt-3 shadow-[0_-8px_20px_rgba(0,0,0,.06)]">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-neutral-200" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold">등록된 장소 {zones.length}</h2>
          <button
            type="button"
            onClick={() => navigate('/safe-place-setup')}
            className="rounded-full bg-main-yellow px-3 py-1.5 text-[10px] font-semibold"
          >
            + 안전장소 추가
          </button>
        </div>
        {isLoading && (
          <p className="py-6 text-center text-xs text-neutral-400">
            불러오는 중...
          </p>
        )}
        {error && (
          <p className="py-3 text-center text-xs text-red-500">{error}</p>
        )}
        {!isLoading && !error && zones.length === 0 && (
          <p className="py-6 text-center text-xs text-neutral-400">
            등록된 안전장소가 없어요.
          </p>
        )}
        <div className="no-scrollbar max-h-[145px] overflow-y-auto">
          {zones.map((zone) => {
            const enabled = !disabledZones.has(zone.id)
            return (
              <div key={zone.id} className="flex items-center border-b py-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-xs font-medium">
                    {zone.name}
                  </span>
                  <span className="mt-1 block text-[10px] text-neutral-400">
                    반경 {zone.radiusM}m
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`${zone.name} 알림 ${enabled ? '끄기' : '켜기'}`}
                  aria-pressed={enabled}
                  onClick={() =>
                    setDisabledZones((current) => {
                      const next = new Set(current)
                      if (enabled) next.add(zone.id)
                      else next.delete(zone.id)
                      return next
                    })
                  }
                  className={`h-5 w-9 rounded-full p-0.5 ${enabled ? 'bg-point-blue' : 'bg-neutral-300'}`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? 'translate-x-4' : ''}`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {selectedZone && (
        <div
          className="absolute inset-0 z-[60] flex items-end justify-center bg-black/45"
          onClick={() => setSelectedZone(null)}
        >
          <section
            className="w-full rounded-t-[24px] bg-white px-5 pb-7 pt-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-center text-sm font-bold">
              {selectedZone.name}
            </h2>
            <p className="mt-1 text-center text-xs text-neutral-400">
              반경 {selectedZone.radiusM}m
            </p>
            <button
              type="button"
              onClick={() =>
                navigate('/safe-zone-setup', { state: { zone: selectedZone } })
              }
              className="mt-5 h-12 w-full rounded-xl bg-main-yellow text-sm font-semibold"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => void removeZone()}
              className="mt-2 h-12 w-full rounded-xl border border-point-red text-sm font-semibold text-point-red"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              className="mt-2 h-11 w-full text-xs text-neutral-400"
            >
              취소
            </button>
          </section>
        </div>
      )}

      <BottomNavigation />
    </main>
  )
}
