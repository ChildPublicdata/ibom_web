import { useEffect, useState } from 'react'
import notificationIcon from '@/assets/icons/notification.svg'

type NotificationButtonProps = {
  className?: string
}

export function NotificationButton({
  className = 'h-7 w-7',
}: NotificationButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return
    const timer = window.setTimeout(() => setIsVisible(false), 2200)
    return () => window.clearTimeout(timer)
  }, [isVisible])

  return (
    <>
      <button
        type="button"
        aria-label="알림"
        onClick={() => setIsVisible(true)}
      >
        <img src={notificationIcon} className={className} alt="" />
      </button>
      {isVisible && (
        <div
          role="status"
          className="fixed left-1/2 top-20 z-[120] w-max max-w-[calc(100%-40px)] -translate-x-1/2 rounded-full bg-neutral-800 px-4 py-2.5 text-xs text-white shadow-lg"
        >
          알림 기능은 아직 개발 중이에요.
        </div>
      )}
    </>
  )
}
