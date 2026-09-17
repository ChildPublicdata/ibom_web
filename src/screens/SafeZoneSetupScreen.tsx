import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { SetupMap } from '@/components/SetupMap'
import { SetupHeader } from '@/components/SetupHeader'
import {
  hasSeenSetupOnboarding,
  markSetupOnboardingSeen,
} from '@/lib/onboardingStorage'
import { createSafeZone, updateSafeZone, type SafeZone } from '@/lib/safetyApi'
import { useAppStore } from '@/store/useAppStore'

export function SafeZoneSetupScreen() {
  const { state } = useLocation()
  const editingZone = (state as { zone?: SafeZone } | null)?.zone
  const [showGuide, setShowGuide] = useState(
    () => !editingZone && !hasSeenSetupOnboarding('safe-zone'),
  )
  const [radius, setRadius] = useState(editingZone?.radiusM ?? 100)
  const [name, setName] = useState(editingZone?.name ?? '내 안전구역')
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const storedSafePlacePosition = useAppStore(
    (state) => state.safePlacePosition,
  )
  const safePlacePosition = editingZone
    ? { lat: editingZone.centerLat, lng: editingZone.centerLon }
    : storedSafePlacePosition

  const dismissGuide = () => {
    markSetupOnboardingSeen('safe-zone')
    setShowGuide(false)
  }

  const saveZone = async () => {
    if (!safePlacePosition) {
      setError('먼저 안전장소를 선택해 주세요.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const input = {
        name,
        centerLat: safePlacePosition.lat,
        centerLon: safePlacePosition.lng,
        radiusM: radius,
      }
      if (editingZone) await updateSafeZone(editingZone.id, input)
      else await createSafeZone(input)
      setIsComplete(true)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : '안전구역을 저장하지 못했습니다.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <SetupHeader title="안전구역" description="구역의 범위를 설정하세요." />
      <section className="min-h-0 flex-1">
        <SetupMap
          circleRadius={radius}
          selectedPosition={safePlacePosition ?? undefined}
          showHome
        />
      </section>
      <section className="z-10 bg-white px-4 pb-3 pt-4 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between text-[11px]">
          <span>30m</span>
          <span>{radius}m</span>
        </div>
        <input
          aria-label="안전구역 반경"
          value={radius}
          onChange={(event) => setRadius(Number(event.target.value))}
          type="range"
          min="30"
          max="200"
          className="mt-2 w-full accent-[#ffd54f]"
        />
        <label className="mt-3 block text-xs font-medium">
          구역 이름
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="이름을 입력하세요."
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-main-yellow"
          />
        </label>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium">이탈 시 알림</p>
            <p className="mt-1 text-[10px] text-slate-400">
              구역을 벗어나면 알려드려요.
            </p>
          </div>
          <button
            onClick={() => setAlertEnabled((enabled) => !enabled)}
            type="button"
            aria-pressed={alertEnabled}
            className={`h-6 w-10 rounded-full p-0.5 transition ${alertEnabled ? 'bg-[#3f82ef]' : 'bg-slate-300'}`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow transition ${alertEnabled ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>
        {error && (
          <p className="mt-2 text-center text-[10px] text-red-500">{error}</p>
        )}
        <button
          onClick={saveZone}
          disabled={isSaving || !name.trim()}
          type="button"
          className="mt-3 h-11 w-full rounded-lg bg-[#ffd54f] text-xs font-semibold"
        >
          {isSaving
            ? '저장 중...'
            : editingZone
              ? '보호구역 수정'
              : '보호구역 저장'}
        </button>
      </section>
      <BottomNavigation />
      {showGuide && (
        <div
          className="absolute inset-0 z-[60] bg-black/70 text-white"
          onClick={dismissGuide}
        >
          <p className="absolute left-5 top-[105px] text-lg font-bold leading-6">
            안전장소 근처에
            <br />
            <span className="text-[#ffb000]">안전구역 범위</span>를 설정하세요!
          </p>
          <div className="absolute left-1/2 top-[31%] -translate-x-1/2">
            <div className="grid h-[116px] w-[116px] place-items-center rounded-full border-2 border-dashed border-[#ff9800] bg-[#fff3cb]/90">
              <div className="flex flex-col items-center">
                <img
                  alt="안전장소"
                  className="h-[62px] w-[62px]"
                  src={homeMarkerIcon}
                />
                <span className="-mt-1 text-sm font-semibold text-slate-950">
                  집
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[280px] left-4 right-4 rounded-2xl border-2 border-dashed border-[#ff9800] bg-white px-3 py-2 text-slate-950">
            <div className="flex justify-between text-[11px]">
              <span>30m</span>
              <span>{radius}m</span>
            </div>
            <input
              aria-label="안전구역 반경 안내"
              value={radius}
              readOnly
              type="range"
              min="30"
              max="200"
              className="mt-2 w-full accent-[#ffd54f]"
            />
          </div>

          <div className="absolute bottom-[188px] left-4 right-4 rounded-2xl border-2 border-dashed border-[#ff9800] bg-white p-2 text-slate-950">
            <div className="flex h-12 items-center justify-between rounded-lg border border-slate-200 px-3">
              <span className="text-[10px] text-slate-400">
                구역을 벗어나면 알려드려요.
              </span>
              <span className="h-6 w-10 rounded-full bg-[#3f82ef] p-0.5">
                <span className="block h-5 w-5 translate-x-4 rounded-full bg-white shadow" />
              </span>
            </div>
          </div>
        </div>
      )}
      {isComplete && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-7">
          <section className="w-full rounded-2xl bg-white p-5 text-center">
            <p className="mt-4 text-sm font-semibold">설정이 완료되었습니다!</p>
            <div className="py-8 text-6xl text-[#6ed36c]">✓</div>
            <button
              onClick={() => navigate(editingZone ? '/safe-places' : '/home')}
              type="button"
              className="h-11 w-full rounded-lg bg-[#ffd54f] text-xs font-semibold"
            >
              확인
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
