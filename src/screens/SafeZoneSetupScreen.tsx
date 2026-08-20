import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeMarkerIcon from '@/assets/icons/home-marker.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { SetupMap } from '@/components/SetupMap'
import { useAppStore } from '@/store/useAppStore'

export function SafeZoneSetupScreen() {
  const [showGuide, setShowGuide] = useState(true)
  const [radius, setRadius] = useState(100)
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const navigate = useNavigate()
  const safePlacePosition = useAppStore((state) => state.safePlacePosition)

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <header className="relative z-10 bg-white px-5 pb-3 pt-12">
        <div className="flex items-center justify-between">
          <span className="text-sm">‹</span>
          <div>
            <h1 className="text-base font-bold">안전구역</h1>
            <p className="mt-1 text-[11px] text-slate-400">
              구역의 범위를 설정하세요.
            </p>
          </div>
          <button type="button" className="text-lg text-slate-500">
            ×
          </button>
        </div>
      </header>
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
        <button
          onClick={() => setIsComplete(true)}
          type="button"
          className="mt-3 h-11 w-full rounded-lg bg-[#ffd54f] text-xs font-semibold"
        >
          보호구역 저장
        </button>
      </section>
      <BottomNavigation />
      {showGuide && (
        <div
          className="absolute inset-0 z-20 flex flex-col bg-black/70 px-7 pb-7 pt-32 text-white"
          onClick={() => setShowGuide(false)}
        >
          <p className="text-lg font-bold">
            안전장소 근처에
            <br />
            <span className="text-[#ffb000]">안전구역 범위</span>를 설정하세요!
          </p>
          <div className="mt-20 flex flex-col items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-[#ff9800] bg-[#fff3cb]/75">
              <img alt="안전장소" className="h-16 w-16" src={homeMarkerIcon} />
            </div>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            type="button"
            className="mt-auto h-11 w-full rounded-lg bg-[#ffd54f] text-xs font-semibold text-slate-950"
          >
            반경 설정하기
          </button>
          <BottomNavigation className="mt-6 rounded-2xl border-0" />
        </div>
      )}
      {isComplete && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-7">
          <section className="w-full rounded-2xl bg-white p-5 text-center">
            <p className="mt-4 text-sm font-semibold">설정이 완료되었습니다!</p>
            <div className="py-8 text-6xl text-[#6ed36c]">✓</div>
            <button
              onClick={() => navigate('/home')}
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
