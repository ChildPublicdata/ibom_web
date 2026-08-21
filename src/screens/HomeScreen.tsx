import { useState } from 'react'
import notificationIcon from '@/assets/icons/notification.svg'
import phoneIcon from '@/assets/icons/phone.svg'
import { BottomNavigation } from '@/components/BottomNavigation'

const places = [
  { name: '바른손외과의원', distance: '2.4km', type: '외과' },
  { name: '한사랑의원', distance: '3.6km', type: '한의원' },
  { name: '이준형치과의원', distance: '12km', type: '치과' },
  { name: '참내과의원', distance: '12.2km', type: '내과' },
]

function AssetPlaceholder({ label, className = '' }: { label: string; className?: string }) {
  return <span aria-label={`${label} 이미지 영역`} className={`grid place-items-center rounded-full border border-dashed border-[#d7a82c] bg-[#fff8d9] text-center text-[8px] font-semibold leading-tight text-[#9a7413] ${className}`}>{label}</span>
}

function PublishingMap() {
  return (
    <div className="relative h-full overflow-hidden bg-[#f6f7f5]">
      <div className="absolute -left-20 top-[34%] h-20 w-[145%] -rotate-6 bg-white shadow-[0_0_0_1px_#e8e8e8]" />
      <div className="absolute -right-24 top-[8%] h-16 w-[90%] rotate-[62deg] bg-white shadow-[0_0_0_1px_#e8e8e8]" />
      <div className="absolute -left-12 bottom-[18%] h-14 w-[130%] rotate-6 bg-white shadow-[0_0_0_1px_#e8e8e8]" />
      <div className="absolute left-[12%] top-[9%] h-24 w-20 rotate-12 rounded-lg border border-[#ececea] bg-white/70" />
      <div className="absolute right-[12%] top-[18%] h-28 w-28 -rotate-6 rounded-lg border border-[#ececea] bg-white/70" />
      <div className="absolute left-[38%] top-[44%] h-24 w-24 rotate-6 rounded-lg border border-[#ececea] bg-white/70" />
    </div>
  )
}

export function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [moving, setMoving] = useState(true)
  const categories = ['소아과', '병원', '약국', '경찰서', '어린이보호구역']

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white text-[#202020]">
      <header className="relative z-30 bg-white px-4 pb-2 pt-4 shadow-sm">
        <div className="flex h-10 items-center justify-between">
          <span className="text-xl tracking-[-0.04em]">LOGO</span>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="전화 걸기"><img src={phoneIcon} className="h-7 w-7" alt="" /></button>
            <button type="button" aria-label="알림"><img src={notificationIcon} className="h-7 w-7" alt="" /></button>
          </div>
        </div>
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setSelectedCategory(selectedCategory === category ? null : category)} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] shadow-sm transition ${selectedCategory === category ? 'border-[#ffd54f] bg-[#ffd54f] font-semibold' : 'border-[#dedbd5] bg-[#fffdf8]'}`}>
              {category}
            </button>
          ))}
        </div>
      </header>

      <section className="relative min-h-0 flex-1">
        <PublishingMap />
        <div className="absolute left-3 top-4 z-10 flex flex-col gap-3">
          <button type="button" className="flex flex-col items-center gap-1 text-[11px] font-medium">
            <AssetPlaceholder label="아이 이미지" className="h-11 w-11 border-4 border-white shadow-md" />아이 위치
          </button>
          <button type="button" className="flex flex-col items-center gap-1 text-[11px] font-medium">
            <span className="grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-[#48c7ee] text-xl text-white shadow-md">◎</span>내 위치
          </button>
        </div>

        <div className={`absolute left-1/2 top-[42%] z-10 -translate-x-1/2 transition-all duration-700 ${moving ? 'translate-x-5 -translate-y-4' : ''}`}>
          <button type="button" onClick={() => setMoving((value) => !value)} className="relative block" aria-label="자녀 이동 상태 보기">
            <span className="absolute -inset-3 animate-ping rounded-full bg-[#ffd54f]/30" />
            <AssetPlaceholder label="자녀 위치 이미지" className="relative h-[78px] w-[78px] border-[5px] border-white shadow-lg" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-[#eee7d9] bg-[#fffaf0]/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <AssetPlaceholder label="아이 이미지" className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs"><b>우리 아이는 지금</b></p>
              <p className="mt-0.5 text-sm font-bold">보문초등학교 주변에 있어요.</p>
              <p className="mt-1 text-[9px] text-slate-500">2026.08.20 오후 12:00 · GPS</p>
              <p className={`mt-1 text-xs font-semibold ${moving ? 'text-[#55b866]' : 'text-slate-500'}`}>{moving ? '안심루트로 이동 중입니다.' : '현재 위치에 머물고 있습니다.'}</p>
            </div>
          </div>
        </div>

        {selectedCategory && (
          <section className="absolute inset-x-0 bottom-0 z-30 max-h-[62%] overflow-y-auto rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,.12)]">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-4">
              <button type="button" onClick={() => setSelectedCategory(null)} className="text-2xl leading-none text-slate-500">‹</button>
              <h2 className="text-sm font-bold">{selectedCategory}</h2>
              <button type="button" onClick={() => setSelectedCategory(null)} aria-label="닫기" className="text-xl text-slate-500">×</button>
            </div>
            {places.map((place) => (
              <article key={place.name} className="border-b px-5 py-4">
                <p className="text-xs font-bold">{place.name} <span className="ml-1 font-normal text-[#3b82f6]">{place.distance}</span></p>
                <p className="mt-2 text-[10px] text-slate-400"><span className="text-[#ff9800]">◷</span> 월–토 · 09:00–18:00</p>
                <p className="mt-1 text-[10px] text-slate-400"><span className="text-[#ff9800]">⌂</span> {place.type}</p>
              </article>
            ))}
          </section>
        )}
      </section>
      <BottomNavigation />
    </main>
  )
}
