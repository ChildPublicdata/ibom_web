import homeIcon from '@/assets/icons/home.svg'
import menuIcon from '@/assets/icons/menu.svg'
import safeZoneIcon from '@/assets/icons/safe-zone.svg'

type BottomNavigationProps = { className?: string; highlighted?: boolean }

function NavigationItems() {
  return (
    <>
      <span className="flex flex-col items-center gap-0.5">
        <img src={homeIcon} alt="" className="h-8 w-8" />홈
      </span>
      <span className="flex flex-col items-center gap-0.5">
        <img src={safeZoneIcon} alt="" className="h-8 w-8" />안전 구역 모드
      </span>
      <span className="flex flex-col items-center gap-0.5">
        <img src={menuIcon} alt="" className="h-8 w-8" />메뉴
      </span>
    </>
  )
}

export function BottomNavigation({
  className = '',
  highlighted = false,
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
          <NavigationItems />
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`flex h-[72px] items-center justify-around border-t border-slate-100 bg-white text-[11px] text-slate-900 ${className}`}
    >
      <NavigationItems />
    </nav>
  )
}
