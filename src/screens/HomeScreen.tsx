import { Link } from 'react-router-dom'
import { KakaoMap, type KakaoMapCoordinate } from '@/components/KakaoMap'

const seoulCityHall = { lat: 37.5665, lng: 126.978 }

export function HomeScreen() {
  const handleMapClick = (position: KakaoMapCoordinate) => {
    console.info('선택한 지도 좌표:', position)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">홈</h1>
        <p className="mt-2 text-slate-600">
          지도를 클릭해 위치 좌표를 확인해 보세요.
        </p>
        <div className="mt-5 h-[480px] overflow-hidden rounded-xl border">
          <KakaoMap
            center={seoulCityHall}
            markers={[{ id: 'city-hall', position: seoulCityHall }]}
            circle={{ center: seoulCityHall, radius: 300 }}
            onClick={handleMapClick}
          />
        </div>
        <Link
          className="mt-5 inline-block text-sm font-medium text-sky-600"
          to="/"
        >
          처음으로 돌아가기
        </Link>
      </section>
    </main>
  )
}
