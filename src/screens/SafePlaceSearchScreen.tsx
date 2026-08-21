import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import notificationIcon from '@/assets/icons/notification.svg'
import phoneIcon from '@/assets/icons/phone.svg'
import searchIcon from '@/assets/icons/search.svg'

const initialRecentPlaces = [
  { id: 1, name: '보문초등학교', date: '08. 07.' },
  { id: 2, name: '삐약학원', date: '08. 07.' },
]

export function SafePlaceSearchScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [recentPlaces, setRecentPlaces] = useState(initialRecentPlaces)

  const visiblePlaces = recentPlaces.filter((place) =>
    place.name.includes(query.trim()),
  )

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white text-[#202020]">
      <header className="border-b border-slate-100 bg-white px-5 pb-4 pt-5">
        <div className="flex h-10 items-center justify-between">
          <span className="text-2xl tracking-[-0.04em]">LOGO</span>
          <div className="flex items-center gap-5">
            <button type="button" aria-label="전화 걸기">
              <img src={phoneIcon} alt="" className="h-7 w-7" />
            </button>
            <button type="button" aria-label="알림">
              <img src={notificationIcon} alt="" className="h-7 w-7" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="text-3xl font-light leading-none text-slate-600"
          >
            ‹
          </button>
          <h1 className="mr-auto ml-6 text-xl font-bold tracking-[-0.04em]">
            안전장소
          </h1>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => navigate('/safe-place-setup')}
            className="text-3xl font-light leading-none text-slate-600"
          >
            ×
          </button>
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
        {visiblePlaces.map((place) => (
          <article
            key={place.id}
            className="flex h-14 items-center border-b border-slate-200"
          >
            <span className="mr-4 h-8 w-8 shrink-0 rounded-full bg-[#f5f5f5]" />
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left text-sm"
              onClick={() => navigate('/safe-place-setup')}
            >
              {place.name}
            </button>
            <time className="mr-5 text-xs text-slate-400">{place.date}</time>
            <button
              type="button"
              aria-label={`${place.name} 최근 검색 삭제`}
              onClick={() =>
                setRecentPlaces((places) =>
                  places.filter((item) => item.id !== place.id),
                )
              }
              className="text-xl font-light text-slate-500"
            >
              ×
            </button>
          </article>
        ))}

        {query && visiblePlaces.length === 0 && (
          <p className="pt-16 text-center text-sm text-slate-400">
            검색 결과가 없습니다.
          </p>
        )}
      </section>
    </main>
  )
}
