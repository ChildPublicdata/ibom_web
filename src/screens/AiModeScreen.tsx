import { useEffect, useMemo, useRef, useState } from 'react'
import headerLogo from '@/assets/header-logo.svg'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import homeMyLocationIcon from '@/assets/icons/home-my-location.svg'
import riskAreaMarker from '@/assets/icons/risk-area-marker.svg'
import childStationary from '@/assets/child-motion/child-stationary.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { PhoneCallButton } from '@/components/CallModal'
import { NotificationButton } from '@/components/NotificationButton'
import {
  KakaoMap,
  type KakaoMapBounds,
  type KakaoMapCoordinate,
} from '@/components/KakaoMap'
import {
  getZoneExplanation,
  listHazardGrids,
  listRiskZones,
  type AiExplanation,
  type HazardGrid,
  type RiskZone,
} from '@/lib/safetyApi'

// 백엔드의 AI 위험구역 시연 데이터가 있는 안양 평촌 인근 좌표입니다.
const MAP_CENTER = { lat: 37.401, lng: 126.971 }

const gradeStyles = [
  { grade: '1급', color: '#EF5350' },
  { grade: '2급', color: '#FF9800' },
  { grade: '3급', color: '#FFD54F' },
  { grade: '4급', color: '#4CAF50' },
]

const gradeNumber = (grade: string) => {
  const normalized = grade.toUpperCase()
  if (normalized === 'DANGER') return 1
  if (normalized === 'CAUTION') return 2
  if (normalized === 'WATCH') return 3
  if (normalized === 'SAFE' || normalized === 'NORMAL') return 4
  return 4
}

const gridGradeNumber = (grid: HazardGrid) =>
  Math.min(4, Math.max(1, grid.level))

const zoneColor = (grade: string) => gradeStyles[gradeNumber(grade) - 1].color

function gridBounds(grid: HazardGrid) {
  const halfSize = grid.sizeM / 2
  const latitudeDelta = halfSize / 111_320
  const longitudeDelta =
    halfSize / (111_320 * Math.cos((grid.lat * Math.PI) / 180))
  return {
    southWest: {
      lat: grid.lat - latitudeDelta,
      lng: grid.lng - longitudeDelta,
    },
    northEast: {
      lat: grid.lat + latitudeDelta,
      lng: grid.lng + longitudeDelta,
    },
  }
}

export function AiModeScreen() {
  const [showLegend, setShowLegend] = useState(false)
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)
  const [selectedArea, setSelectedArea] = useState<RiskZone | null>(null)
  const [mapCenter, setMapCenter] = useState<KakaoMapCoordinate>(MAP_CENTER)
  const [mapBounds, setMapBounds] = useState<KakaoMapBounds | null>(null)
  const [zones, setZones] = useState<RiskZone[]>([])
  const [grids, setGrids] = useState<HazardGrid[]>([])
  const [gradeCounts, setGradeCounts] = useState([0, 0, 0, 0])
  const [selectedGrade, setSelectedGrade] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sheetPointerY = useRef<number | null>(null)
  const wasSheetDragged = useRef(false)

  const accidentTotals = useMemo(
    () => ({
      fatalities: zones.reduce((sum, zone) => sum + zone.fatalities, 0),
      serious: zones.reduce((sum, zone) => sum + zone.serious, 0),
      minor: zones.reduce((sum, zone) => sum + zone.minor, 0),
    }),
    [zones],
  )

  useEffect(() => {
    if (!mapBounds) return
    let cancelled = false
    const bounds = {
      swLat: mapBounds.southWest.lat,
      swLng: mapBounds.southWest.lng,
      neLat: mapBounds.northEast.lat,
      neLng: mapBounds.northEast.lng,
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setError(null)
    Promise.all([listRiskZones(bounds), listHazardGrids(bounds)])
      .then(([riskZones, grids]) => {
        if (cancelled) return
        setZones(riskZones)
        setGrids(grids)
        const counts = [0, 0, 0, 0]
        grids.forEach((grid) => {
          counts[gridGradeNumber(grid) - 1] += 1
        })
        setGradeCounts(counts)
        setSelectedGrade((current) => {
          if (counts[current - 1] > 0) return current
          const firstAvailable = counts.findIndex((count) => count > 0)
          return firstAvailable >= 0 ? firstAvailable + 1 : 1
        })
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(
            requestError instanceof Error
              ? requestError.message
              : '위험구역 정보를 불러오지 못했습니다.',
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mapBounds])

  const markers = useMemo(
    () => [
      {
        id: 'child',
        position: MAP_CENTER,
        imageUrl: childStationary,
        imageSize: { width: 72, height: 72 },
      },
      ...zones.map((zone) => ({
        id: zone.zoneId,
        position: { lat: zone.lat, lng: zone.lng },
        imageUrl: riskAreaMarker,
        imageSize: { width: 42, height: 42 },
        onClick: () => setSelectedArea(zone),
      })),
    ],
    [zones],
  )

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white text-neutral-900">
      <header className="relative z-30 bg-white px-4 pb-2 pt-4 shadow-sm">
        <div className="flex h-10 items-center justify-between">
          <img src={headerLogo} alt="아이봄" className="h-[34px] w-auto" />
          <div className="flex items-center gap-4">
            <PhoneCallButton />
            <NotificationButton />
          </div>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden">
        <KakaoMap
          center={mapCenter}
          level={2}
          markers={markers}
          circles={zones.map((zone) => ({
            center: { lat: zone.lat, lng: zone.lng },
            radius: zone.radiusM,
            strokeColor: zoneColor(zone.grade),
            strokeOpacity: 0.95,
            fillColor: zoneColor(zone.grade),
            fillOpacity: 0.35,
          }))}
          rectangles={grids.map((grid) => ({
            ...gridBounds(grid),
            strokeColor: gradeStyles[gridGradeNumber(grid) - 1].color,
            strokeOpacity: 0.65,
            fillColor: gradeStyles[gridGradeNumber(grid) - 1].color,
            fillOpacity: gridGradeNumber(grid) === 1 ? 0.28 : 0.18,
          }))}
          onBoundsChange={setMapBounds}
        />

        <div className="absolute left-3 top-5 z-10 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setMapCenter(MAP_CENTER)}
            className="flex flex-col items-center gap-1 text-[11px] font-medium"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-sub-cream shadow-md">
              <img src={homeChildAvatar} alt="" className="h-8 w-8" />
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

        <button
          type="button"
          onClick={() => setShowLegend((visible) => !visible)}
          aria-expanded={showLegend}
          className="absolute right-3 top-5 z-10 flex flex-col items-center gap-1 text-[11px] font-medium"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-neutral-200 bg-white text-2xl font-light text-main-orange shadow-md">
            ⓘ
          </span>
          등급 기준
        </button>

        {showLegend && (
          <LegendCard
            totals={accidentTotals}
            onClose={() => setShowLegend(false)}
          />
        )}

        {(isLoading || error) && (
          <p
            className={`absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-white/95 px-3 py-2 text-[10px] shadow ${error ? 'text-point-red' : 'text-neutral-500'}`}
          >
            {error ?? 'AI 위험도를 불러오고 있어요.'}
          </p>
        )}

        <section
          className={`absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-[24px] bg-white px-4 pb-4 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,.15)] transition-[height] duration-300 ${isSheetExpanded ? 'h-[64%]' : 'h-[116px]'}`}
        >
          <button
            type="button"
            aria-label={
              isSheetExpanded ? '위험구역 목록 접기' : '위험구역 목록 펼치기'
            }
            className="mx-auto mb-4 flex h-4 w-full touch-none items-start justify-center"
            onClick={() => {
              if (wasSheetDragged.current) {
                wasSheetDragged.current = false
                return
              }
              setIsSheetExpanded((expanded) => !expanded)
            }}
            onPointerDown={(event) => {
              sheetPointerY.current = event.clientY
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerUp={(event) => {
              if (sheetPointerY.current !== null) {
                const distance = event.clientY - sheetPointerY.current
                if (Math.abs(distance) > 24) {
                  wasSheetDragged.current = true
                  setIsSheetExpanded(distance < 0)
                }
              }
              sheetPointerY.current = null
            }}
          >
            <span className="h-1 w-12 rounded-full bg-neutral-200" />
          </button>
          <GradeSummary
            counts={gradeCounts}
            selectedGrade={selectedGrade}
            onSelect={setSelectedGrade}
          />
          {isSheetExpanded && (
            <>
              <p className="mb-2 mt-4 text-[11px] text-neutral-400">
                위험구역 · {selectedGrade}급
              </p>
              <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto">
                {zones
                  .filter((zone) => gradeNumber(zone.grade) === selectedGrade)
                  .map((area) => (
                    <button
                      key={area.zoneId}
                      type="button"
                      onClick={() => {
                        setMapCenter({ lat: area.lat, lng: area.lng })
                        setIsSheetExpanded(false)
                        setSelectedArea(null)
                      }}
                      className="flex w-full items-center rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left shadow-sm"
                    >
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-xs">
                          {area.district} {area.roadName}
                        </strong>
                        <span className="mt-1 block text-[10px] text-neutral-400">
                          사고 {area.accidents}건 · 사망 {area.fatalities} ·
                          중상 {area.serious} · EPDO {area.epdo}
                        </span>
                      </span>
                      <span
                        className="ml-2 rounded-full px-2 py-1 text-[9px] font-bold text-white"
                        style={{
                          backgroundColor: gradeStyles[selectedGrade - 1].color,
                        }}
                      >
                        {selectedGrade}급
                      </span>
                    </button>
                  ))}
                {!isLoading &&
                  !zones.some(
                    (zone) => gradeNumber(zone.grade) === selectedGrade,
                  ) && (
                    <p className="py-8 text-center text-xs text-neutral-400">
                      현재 지도 범위에 {selectedGrade}급 위험구역이 없어요.
                    </p>
                  )}
              </div>
            </>
          )}
        </section>
      </section>

      {selectedArea && (
        <DangerDetail
          area={selectedArea}
          onClose={() => setSelectedArea(null)}
        />
      )}
      <BottomNavigation active="ai" />
    </main>
  )
}

function LegendCard({
  totals,
  onClose,
}: {
  totals: { fatalities: number; serious: number; minor: number }
  onClose: () => void
}) {
  return (
    <button
      type="button"
      aria-label="등급 기준 닫기"
      onClick={onClose}
      className="absolute right-3 top-[82px] z-30 rounded-xl bg-white px-3 py-3 text-left shadow-lg"
    >
      <p className="mb-2 text-[9px] text-neutral-400">사고지점</p>
      <div className="space-y-2 text-[11px]">
        <LegendRow
          color="#EF5350"
          label={`사망(${totals.fatalities.toLocaleString()})`}
          outlined
        />
        <LegendRow
          color="#FF9800"
          label={`중상(${totals.serious.toLocaleString()})`}
          outlined
        />
        <LegendRow
          color="#FFD54F"
          label={`경상(${totals.minor.toLocaleString()})`}
          outlined
        />
      </div>
      <p className="mb-2 mt-4 text-[9px] text-neutral-400">위험등급</p>
      <div className="space-y-2 text-[11px]">
        <LegendRow color="#EF5350" label="1급 위험" />
        <LegendRow color="#FF9800" label="2급 주의" />
        <LegendRow color="#FFD54F" label="3급 관찰" />
        <LegendRow color="#4CAF50" label="4급 안전" />
      </div>
    </button>
  )
}

function LegendRow({
  color,
  label,
  outlined = false,
}: {
  color: string
  label: string
  outlined?: boolean
}) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="h-3.5 w-3.5 rounded-[4px]"
        style={
          outlined
            ? { border: `2px solid ${color}`, borderRadius: '999px' }
            : { backgroundColor: color }
        }
      />
      {label}
    </span>
  )
}

function GradeSummary({
  counts,
  selectedGrade,
  onSelect,
}: {
  counts: number[]
  selectedGrade: number
  onSelect: (grade: number) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {gradeStyles.map((item, index) => (
        <button
          type="button"
          key={item.grade}
          onClick={() => onSelect(index + 1)}
          aria-pressed={selectedGrade === index + 1}
          className={`rounded-lg py-2 text-center text-white ${selectedGrade === index + 1 ? 'ring-2 ring-neutral-700 ring-offset-2' : ''}`}
          style={{ backgroundColor: item.color }}
        >
          <p className="text-[10px]">{item.grade}</p>
          <strong className="mt-0.5 block text-base">{counts[index]}</strong>
        </button>
      ))}
    </div>
  )
}

function DangerDetail({
  area,
  onClose,
}: {
  area: RiskZone
  onClose: () => void
}) {
  const [explanation, setExplanation] = useState<AiExplanation | null>(null)

  useEffect(() => {
    let cancelled = false
    getZoneExplanation(area.zoneId)
      .then((result) => {
        if (!cancelled) setExplanation(result)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [area.zoneId])

  return (
    <div
      className="absolute inset-0 z-[60] grid place-items-center bg-black/60 px-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="위험구역 상세"
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded-2xl border-2 border-point-red bg-white p-4 shadow-xl"
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold">
              {area.district} {area.roadName}
            </h2>
            <p className="mt-1 text-[10px] text-neutral-400">
              사고 {area.accidents}건 · 사망 {area.fatalities} · 중상{' '}
              {area.serious} · EPDO {area.epdo}
            </p>
          </div>
          <span className="rounded-full bg-point-red px-2.5 py-1 text-[10px] font-bold text-white">
            1급
          </span>
        </div>
        <p className="mt-5 text-[11px] text-neutral-500">
          {explanation?.summary ?? '여기서 이런 일이 있었어요'}
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs">
          <li>최근 3년간 사망사고 {area.fatalities}건 발생</li>
          <li>중상자 {area.serious}명 발생</li>
          <li>사고 위험 집중 (EPDO {area.epdo})</li>
        </ul>
        <div className="mt-5 rounded-xl border border-point-blue bg-blue-50 p-4 text-xs text-point-blue">
          <p className="mb-2 text-[11px]">부모님이 하실 일</p>
          <p className="leading-5">
            {explanation?.action ??
              '가능하면 이 구간을 지나지 않는 경로를 선택해 주세요.'}
          </p>
          <p className="mt-3 rounded-lg bg-white px-3 py-3 text-center font-bold leading-5 text-neutral-900">
            {explanation?.message ??
              '“이 길은 사고가 크게 났던 곳이야. 다른 길로 가자.”'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-point-blue py-3 text-sm font-semibold text-white"
        >
          확인
        </button>
      </section>
    </div>
  )
}
