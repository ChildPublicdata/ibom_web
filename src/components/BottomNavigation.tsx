import homeIcon from '@/assets/icons/home.svg'
import menuIcon from '@/assets/icons/menu.svg'
import safeZoneIcon from '@/assets/icons/safe-zone.svg'
import { useNavigate } from 'react-router-dom'

type BottomNavigationProps = {
  className?: string
  highlighted?: boolean
  active?: 'home' | 'safe-zone' | 'menu'
}

function NavigationItems({
  active = 'home',
}: Pick<BottomNavigationProps, 'active'>) {
  const navigate = useNavigate()
  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/home')}
        className={`flex flex-col items-center gap-0.5 ${active === 'home' ? 'font-semibold' : ''}`}
      >
        <img src={homeIcon} alt="" className="h-8 w-8" />홈
      </button>
      <button
        type="button"
        onClick={() => navigate('/safety-area')}
        className={`flex flex-col items-center gap-0.5 ${active === 'safe-zone' ? 'font-semibold text-point-blue' : ''}`}
      >
        <img src={safeZoneIcon} alt="" className="h-8 w-8" />
        안전 구역 모드
      </button>
      <button
        type="button"
        className={`flex flex-col items-center gap-0.5 ${active === 'menu' ? 'font-semibold' : ''}`}
      >
        <img src={menuIcon} alt="" className="h-8 w-8" />
        메뉴
      </button>
    </>
  )
}

export function BottomNavigation({
  className = '',
  highlighted = false,
  active = 'home',
}: BottomNavigationProps) {
  if (highlighted) {
    return (
      <nav
        className={`relative z-30 flex h-[72px] items-center justify-around bg-transparent text-[11px] text-slate-900 ${className}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-3 right-3 rounded-[26px] border-2 border-dashed border-[#ff9800] bg-white shadow-sm"
        />
        <div className="relative z-10 flex w-full items-center justify-around">
          <NavigationItems active={active} />
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`flex h-[72px] items-center justify-around border-t border-slate-100 bg-white text-[11px] text-slate-900 ${className}`}
    >
      <NavigationItems active={active} />
    </nav>
  )
}
