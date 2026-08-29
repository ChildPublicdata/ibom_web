import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import currentLocationIcon from '@/assets/icons/current-location.svg'
import safePlaceAcademyIcon from '@/assets/icons/safe-place-academy.svg'
import safePlaceHomeIcon from '@/assets/icons/safe-place-home.svg'
import safePlaceHospitalIcon from '@/assets/icons/safe-place-hospital.svg'
import safePlaceSchoolIcon from '@/assets/icons/safe-place-school.svg'
import searchIcon from '@/assets/icons/search.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { SetupMap } from '@/components/SetupMap'
import { SetupHeader } from '@/components/SetupHeader'
import type { KakaoMapCoordinate } from '@/components/KakaoMap'
import { useAppStore } from '@/store/useAppStore'

type SheetState = 'closed' | 'open' | 'collapsed'
type SafePlaceIcon = 'school' | 'hospital' | 'home' | 'academy'

const safePlaceIcons: { id: SafePlaceIcon; label: string; src: string }[] = [
  { id: 'school', label: '학교', src: safePlaceSchoolIcon },
  { id: 'hospital', label: '병원', src: safePlaceHospitalIcon },
  { id: 'home', label: '집', src: safePlaceHomeIcon },
  { id: 'academy', label: '학원', src: safePlaceAcademyIcon },
]

export function SafePlaceSetupScreen() {
  const [showGuide, setShowGuide] = useState(true)
  const [selectedPosition, setSelectedPosition] =
    useState<KakaoMapCoordinate | null>({ lat: 37.5665, lng: 126.978 })
  const [sheetState, setSheetState] = useState<SheetState>('collapsed')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<SafePlaceIcon | null>(null)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
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
        {!showGuide && (
          <button
            type="button"
            onClick={() => navigate('/safe-place-search')}
            className="absolute left-1/2 top-[165px] z-10 inline-flex -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-[#3b82f6] shadow-md"
          >
            <img src={searchIcon} alt="" className="mr-1.5 h-4 w-4" />
            장소 검색하기
          </button>
        )}
      </section>
      <BottomNavigation highlighted={showGuide} />

      {sheetState === 'collapsed' && (
        <button
          onClick={() => setSheetState('open')}
          type="button"
          aria-label="장소 정보 입력 열기"
          className="absolute bottom-[72px] z-10 flex h-10 w-full items-start justify-center rounded-t-[22px] bg-white pt-4 shadow-[0_-5px_18px_rgba(0,0,0,0.08)]"
        >
          <span className="h-[3px] w-12 rounded-full bg-slate-200" />
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
          <div className="flex items-end gap-3">
            <div className="shrink-0">
              <p className="text-xs font-medium">아이콘</p>
              <button
                type="button"
                aria-label="안전장소 아이콘 선택"
                onClick={() => setIsIconPickerOpen(true)}
                className={`mt-1.5 grid h-10 w-10 place-items-center ${selectedIcon ? '' : 'rounded-full border border-slate-300 bg-white'}`}
              >
                {selectedIcon ? (
                  <img
                    src={
                      safePlaceIcons.find((icon) => icon.id === selectedIcon)
                        ?.src
                    }
                    alt=""
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-light text-slate-300">＋</span>
                )}
              </button>
            </div>
            <label className="min-w-0 flex-1 text-xs font-medium">
              장소 이름
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력하세요."
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#ffd54f]"
              />
            </label>
          </div>
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
            disabled={!selectedIcon || !name || !address}
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

      {isIconPickerOpen && (
        <div
          className="absolute inset-0 z-50 grid place-items-center bg-black/65 px-7"
          onClick={() => setIsIconPickerOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="안전장소 아이콘 선택"
            className="w-full rounded-[20px] bg-white px-6 pb-8 pt-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-[-0.03em]">
                아이콘을 선택 해 주세요.
              </h2>
              <button
                type="button"
                aria-label="아이콘 선택 닫기"
                onClick={() => setIsIconPickerOpen(false)}
                className="grid h-9 w-9 place-items-center text-3xl font-light text-neutral-600"
              >
                ×
              </button>
            </div>
            <div className="mx-auto mt-7 grid w-[190px] grid-cols-2 gap-x-8 gap-y-7">
              {safePlaceIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  aria-label={`${icon.label} 아이콘 선택`}
                  onClick={() => {
                    setSelectedIcon(icon.id)
                    setIsIconPickerOpen(false)
                  }}
                  className={`grid h-16 w-16 place-items-center rounded-xl transition ${selectedIcon === icon.id ? 'bg-[#fff5cf] ring-2 ring-[#ffd54f]' : 'hover:bg-neutral-50'}`}
                >
                  <img
                    src={icon.src}
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {showGuide && (
        <div
          className="absolute inset-0 z-20 flex flex-col bg-black/70 px-8 pb-24 pt-20 text-white"
          onClick={() => setShowGuide(false)}
        >
          <div>
            <p className="text-lg font-bold">
              집, 학교, 학원 등<br />
              <span className="text-[#ffb000]">안전장소</span>를 설정하세요!
            </p>
          </div>
          <div className="absolute left-1/2 top-[165px] -translate-x-1/2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                navigate('/safe-place-search')
              }}
              className="inline-flex items-center whitespace-nowrap rounded-full border-2 border-dashed border-[#ff9800] bg-white px-5 py-2 text-sm font-medium text-[#3b82f6] shadow-md"
            >
              <img src={searchIcon} alt="" className="mr-1.5 h-4 w-4" />
              장소 검색하기
            </button>
          </div>

          <svg
            aria-hidden="true"
            className="absolute left-[calc(50%-112px)] top-[198px] h-14 w-12 overflow-visible"
            viewBox="0 0 48 56"
            fill="none"
          >
            <path
              d="M46 3C18 3 10 16 14 40"
              stroke="#FF9800"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 7"
            />
            <path d="M8 35L14.5 47L20 34" fill="#FF9800" />
          </svg>
          <p className="absolute left-9 top-[257px] text-sm leading-relaxed">
            <b className="mr-2 text-base">1</b> 장소를{' '}
            <span className="text-[#ffcf35]">검색</span>해서 찾을 수 있어요
          </p>

          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <span className="grid h-[58px] w-[58px] place-items-center rounded-full border-2 border-dashed border-[#ff9800] bg-white shadow-md">
              <img
                src={currentLocationIcon}
                alt="현재 위치"
                className="h-11 w-11"
              />
            </span>
          </div>
          <svg
            aria-hidden="true"
            className="absolute left-[calc(50%+24px)] top-[calc(44%-5px)] h-14 w-14 overflow-visible"
            viewBox="0 0 56 56"
            fill="none"
          >
            <path
              d="M2 4C34 4 43 16 43 39"
              stroke="#FF9800"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 7"
            />
            <path d="M37 35L43 49L49 35" fill="#FF9800" />
          </svg>
          <p className="absolute left-10 top-[52%] whitespace-nowrap text-sm leading-relaxed">
            <b className="mr-2 text-base">2</b> 실시간으로 나의{' '}
            <span className="text-[#ffcf35]">현위치</span>를 확인할 수 있어요
          </p>

          <svg
            aria-hidden="true"
            className="absolute bottom-[82px] left-9 h-12 w-12 overflow-visible"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path
              d="M4 45C3 19 12 8 32 7"
              stroke="#FF9800"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 7"
            />
            <path d="M26 1L40 6L29 15" fill="#FF9800" />
          </svg>
          <div className="absolute bottom-[150px] left-10 right-5 text-sm leading-7">
            <p>
              <b className="mr-2 text-base">3</b>
              <span className="text-[#ffcf35]">
                안전/위험 구역에 대한 데이터
              </span>
              를 확인할 수 있어요
            </p>
            <p className="pl-8">
              메뉴를 통해 <span className="text-[#ffcf35]">정보를 수정</span>할
              수 있어요
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
