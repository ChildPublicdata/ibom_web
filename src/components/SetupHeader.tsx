import notificationIcon from '@/assets/icons/notification.svg'
import phoneIcon from '@/assets/icons/phone.svg'

type SetupHeaderProps = {
  title: string
  description: string
}

export function SetupHeader({ title, description }: SetupHeaderProps) {
  return (
    <header className="relative z-10 bg-white px-5 pb-4 pt-5">
      <div className="flex h-10 items-center justify-between">
        <span className="text-2xl font-normal tracking-[-0.04em] text-slate-950">
          LOGO
        </span>
        <div className="flex items-center gap-5">
          <img alt="전화" className="h-7 w-7" src={phoneIcon} />
          <img alt="알림" className="h-7 w-7" src={notificationIcon} />
        </div>
      </div>
      <div className="mt-3 flex items-start gap-5">
        <button
          aria-label="뒤로가기"
          className="mt-0.5 text-3xl font-light leading-none text-slate-600"
          type="button"
        >
          ‹
        </button>
        <div className="flex-1 text-left">
          <h1 className="text-xl font-bold tracking-[-0.04em] text-slate-950">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <button
          aria-label="닫기"
          className="mt-0.5 text-3xl font-light leading-none text-slate-600"
          type="button"
        >
          ×
        </button>
      </div>
    </header>
  )
}
