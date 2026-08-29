import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import phoneIcon from '@/assets/icons/phone.svg'

type CallModalProps = {
  open: boolean
  onClose: () => void
  phoneNumber?: string
}

export function CallModal({
  open,
  onClose,
  phoneNumber = '010-1234-5678',
}: CallModalProps) {
  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-y-0 left-1/2 z-[100] flex w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-black/70 px-11"
      role="dialog"
      aria-modal="true"
      aria-label="아이에게 전화 걸기"
      onClick={onClose}
    >
      <div
        className="flex w-full -translate-y-6 flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-10 grid h-[78px] w-[78px] place-items-center overflow-hidden rounded-full border-2 border-main-yellow bg-white shadow-md">
          <img
            src={homeChildAvatar}
            alt="아이"
            className="h-[58px] w-[58px] object-contain"
          />
        </div>
        <a
          href={`tel:${phoneNumber.replaceAll('-', '')}`}
          className="mt-4 flex h-[54px] w-full flex-col items-center justify-center rounded-[20px] bg-main-orange pt-1 text-white shadow-md"
        >
          <strong className="text-base leading-5">전화걸기</strong>
          <span className="text-xs leading-4">{phoneNumber}</span>
        </a>
      </div>
    </div>,
    document.body,
  )
}

type PhoneCallButtonProps = {
  className?: string
}

export function PhoneCallButton({ className = '' }: PhoneCallButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="전화 걸기"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <img src={phoneIcon} className="h-7 w-7" alt="" />
      </button>
      <CallModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
