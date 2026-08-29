import { useEffect, useState } from 'react'
import menuChildLocationIcon from '@/assets/icons/menu-child-location.svg'
import menuCustomerCenterIcon from '@/assets/icons/menu-customer-center.svg'
import menuDeviceSettingsIcon from '@/assets/icons/menu-device-settings.svg'
import menuEditProfileIcon from '@/assets/icons/menu-edit-profile.svg'
import menuRouteIcon from '@/assets/icons/menu-route.svg'
import menuSafePlaceIcon from '@/assets/icons/menu-safe-place.svg'
import homeIcon from '@/assets/icons/home.svg'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
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
  onMenuClick,
}: Pick<BottomNavigationProps, 'active'> & { onMenuClick: () => void }) {
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
        onClick={onMenuClick}
        aria-label="메뉴 열기"
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const menuPanel = isMenuOpen && (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/45">
      <button
        type="button"
        aria-label="메뉴 닫기"
        className="absolute inset-0 cursor-default"
        onClick={() => setIsMenuOpen(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
        className="absolute bottom-[72px] flex h-[443px] w-full max-w-[390px] flex-col rounded-t-[22px] bg-white px-5 pb-4 pt-6 shadow-[0_-8px_32px_rgba(0,0,0,0.14)]"
      >
        <div className="flex items-center px-2">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff7e8]">
            <img src={homeChildAvatar} alt="" className="h-11 w-11" />
          </span>
          <div className="ml-4">
            <p className="text-base font-bold tracking-[-0.03em]">꼬꼬맘</p>
            <p className="mt-1 text-sm text-neutral-400">대전시</p>
          </div>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setIsMenuOpen(false)}
            className="ml-auto grid h-10 w-10 place-items-center text-[34px] font-light leading-none text-neutral-600"
          >
            ×
          </button>
        </div>

        <div className="mx-0 mt-5 border-t border-neutral-200 pt-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <MenuCard icon={menuSafePlaceIcon} label={'안전장소\n설정'} />
            <MenuCard icon={menuChildLocationIcon} label="아이 위치" />
            <MenuCard icon={menuRouteIcon} label="안심루트" />
            <MenuCard icon={menuEditProfileIcon} label="정보수정" />
            <MenuCard icon={menuDeviceSettingsIcon} label="기기설정" />
            <MenuCard icon={menuCustomerCenterIcon} label="고객센터" />
          </div>
        </div>

        <button
          type="button"
          className="mt-4 self-center text-sm text-neutral-300"
        >
          로그아웃
        </button>
      </section>
    </div>
  )

  if (highlighted) {
    return (
      <>
        {menuPanel}
        <nav
          className={`relative z-30 flex h-[72px] items-center justify-around bg-transparent text-[11px] text-slate-900 ${className}`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-3 right-3 rounded-[26px] border-2 border-dashed border-[#ff9800] bg-white shadow-sm"
          />
          <div className="relative z-10 flex w-full items-center justify-around">
            <NavigationItems
              active={active}
              onMenuClick={() => setIsMenuOpen(true)}
            />
          </div>
        </nav>
      </>
    )
  }

  return (
    <>
      {menuPanel}
      <div aria-hidden="true" className="h-[72px] shrink-0" />
      <nav
        className={`fixed bottom-0 left-1/2 z-[51] flex h-[72px] w-full max-w-[390px] -translate-x-1/2 items-center justify-around border-t border-slate-100 bg-white text-[11px] text-slate-900 ${className}`}
      >
        <NavigationItems
          active={isMenuOpen ? 'menu' : active}
          onMenuClick={() => setIsMenuOpen(true)}
        />
      </nav>
    </>
  )
}

function MenuCard({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[112px] flex-col items-center justify-center rounded-xl border border-neutral-100 bg-white px-2 text-center text-[15px] leading-[1.25] shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
    >
      <img src={icon} alt="" className="mb-3 h-11 w-11" />
      <span className="whitespace-pre-line">{label}</span>
    </button>
  )
}
