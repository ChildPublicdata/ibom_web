type BottomNavigationProps = { className?: string }

export function BottomNavigation({ className = '' }: BottomNavigationProps) {
  return (
    <nav
      className={`flex h-[72px] items-center justify-around border-t border-slate-100 bg-white text-[11px] text-slate-900 ${className}`}
    >
      <span className="flex flex-col items-center gap-1">
        <b className="text-2xl font-normal text-[#ff9800]">⌂</b>홈
      </span>
      <span className="flex flex-col items-center gap-1">
        <b className="text-2xl font-normal text-[#ff9800]">◎</b>안전 구역 모드
      </span>
      <span className="flex flex-col items-center gap-1">
        <b className="text-2xl font-normal text-[#ff9800]">☰</b>메뉴
      </span>
    </nav>
  )
}
