import headerLogo from '@/assets/header-logo.svg'
import notificationIcon from '@/assets/icons/notification.svg'
import { PhoneCallButton } from '@/components/CallModal'

type SetupHeaderProps = {
  title: string
  description: string
}

export function SetupHeader({ title, description }: SetupHeaderProps) {
  return (
    <header className="relative z-10 bg-white px-5 pb-3 pt-5">
      <div className="flex h-10 items-center justify-between">
        <img src={headerLogo} alt="아이봄" className="h-7 w-auto" />
        <div className="flex items-center gap-5">
          <PhoneCallButton />
          <img
            alt="알림"
            className="h-[22px] w-[22px] -translate-y-px"
            src={notificationIcon}
          />
        </div>
      </div>
      <div className="mt-2 flex items-start gap-5">
        <button
          aria-label="뒤로가기"
          className="mt-0.5 text-2xl font-light leading-none text-slate-600"
          type="button"
        >
          ‹
        </button>
        <div className="flex-1 text-left">
          <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-950">
            {title}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </header>
  )
}
