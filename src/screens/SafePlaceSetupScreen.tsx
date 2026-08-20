import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/BottomNavigation'
import { SetupMap } from '@/components/SetupMap'
import { SetupHeader } from '@/components/SetupHeader'
import type { KakaoMapCoordinate } from '@/components/KakaoMap'
import { useAppStore } from '@/store/useAppStore'

type SheetState = 'closed' | 'open' | 'collapsed'

export function SafePlaceSetupScreen() {
  const [showGuide, setShowGuide] = useState(true)
  const [selectedPosition, setSelectedPosition] =
    useState<KakaoMapCoordinate | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>('closed')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const pointerStartY = useRef<number | null>(null)
  const navigate = useNavigate()
  const setSafePlacePosition = useAppStore(
    (state) => state.setSafePlacePosition,
  )

  const selectPlace = (position: KakaoMapCoordinate) => {
    setSelectedPosition(position)
    setSheetState('open')
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <SetupHeader
        title="안전장소"
        description="지도를 눌러 장소를 추가하세요."
      />
      <section className="min-h-0 flex-1">
        <SetupMap
          selectedPosition={selectedPosition ?? undefined}
          onClick={selectPlace}
          showPin={Boolean(selectedPosition)}
        />
      </section>
      <BottomNavigation highlighted={showGuide} />

      {sheetState === 'collapsed' && (
        <button
          onClick={() => setSheetState('open')}
          type="button"
          className="absolute bottom-[72px] z-10 flex h-14 w-full items-center justify-center rounded-t-2xl bg-white text-xs font-semibold shadow-[0_-5px_18px_rgba(0,0,0,0.12)]"
        >
          <span className="mr-2 text-lg text-slate-400">—</span> 장소 정보 입력
        </button>
      )}
      {sheetState === 'open' && (
        <section
          className="absolute bottom-[72px] z-10 w-full rounded-t-2xl bg-white px-4 pb-4 pt-2 shadow-[0_-8px_20px_rgba(0,0,0,0.12)]"
          onPointerDown={(event) => {
            pointerStartY.current = event.clientY
          }}
          onPointerUp={(event) => {
            if (
              pointerStartY.current &&
              event.clientY - pointerStartY.current > 60
            )
              setSheetState('collapsed')
            pointerStartY.current = null
          }}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
          <label className="block text-xs font-medium">
            장소 이름
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력하세요."
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#ffd54f]"
            />
          </label>
          <label className="mt-3 block text-xs font-medium">
            상세 주소
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="건물이름 / 층 / 호"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#ffd54f]"
            />
          </label>
          <button
            disabled={!name || !address}
            onClick={() => {
              if (selectedPosition) setSafePlacePosition(selectedPosition)
              navigate('/safe-zone-setup')
            }}
            type="button"
            className="mt-4 h-11 w-full rounded-lg bg-[#ffd54f] text-xs font-semibold disabled:bg-[#ffedb1] disabled:text-white"
          >
            안전장소 저장
          </button>
        </section>
      )}

      {showGuide && (
        <div
          className="absolute inset-0 z-20 flex flex-col bg-black/70 px-8 pb-24 pt-32 text-white"
          onClick={() => setShowGuide(false)}
        >
          <div>
            <p className="text-lg font-bold">
              집, 학교, 학원 등<br />
              <span className="text-[#ffb000]">안전장소</span>를 설정하세요!
            </p>
            <span className="mt-7 inline-block rounded-full bg-white px-5 py-2 text-xs font-medium text-[#337cf0]">
              ⌕ 장소 검색하기
            </span>
          </div>
          <div className="mt-auto space-y-16 text-xs leading-relaxed">
            <p>
              <b>1</b> 장소를 검색해서 찾을 수 있어요
            </p>
            <p>
              <b>2</b> 실시간으로 나의{' '}
              <span className="text-[#ffcf35]">현위치</span>를 확인할 수 있어요
            </p>
            <p>
              <b>3</b> <span className="text-[#ffcf35]">안전/위험 구역</span>에
              대한 데이터를 확인할 수 있어요
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
