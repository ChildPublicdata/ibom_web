import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import homeChildAvatar from '@/assets/icons/home-child-avatar.svg'
import phoneIcon from '@/assets/icons/phone.svg'
import { listChildren } from '@/lib/familyApi'
import { useAppStore } from '@/store/useAppStore'

type CallModalProps = {
  open: boolean
  onClose: () => void
  childName?: string
  phoneNumber?: string | null
  isLoading?: boolean
}

export function CallModal({
  open,
  onClose,
  childName = '아이',
  phoneNumber,
  isLoading = false,
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
            alt={childName}
            className="h-[58px] w-[58px] object-contain"
          />
        </div>
        {phoneNumber ? (
          <a
            href={`tel:${phoneNumber.replaceAll('-', '')}`}
            className="mt-4 flex h-[54px] w-full flex-col items-center justify-center rounded-[20px] bg-main-orange pt-1 text-white shadow-md"
          >
            <strong className="text-base leading-5">
              {childName}에게 전화걸기
            </strong>
            <span className="text-xs leading-4">{phoneNumber}</span>
          </a>
        ) : (
          <div className="mt-4 flex h-[54px] w-full flex-col items-center justify-center rounded-[20px] bg-neutral-400 text-white shadow-md">
            <strong className="text-sm leading-5">
              {isLoading
                ? '자녀 정보를 불러오는 중이에요.'
                : '전화번호 정보가 없어요.'}
            </strong>
          </div>
        )}
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
  const [isLoading, setIsLoading] = useState(false)
  const [childName, setChildName] = useState('아이')
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const selectedChildId = useAppStore((state) => state.selectedChildId)

  const openCallModal = async () => {
    setIsOpen(true)
    setIsLoading(true)
    setPhoneNumber(null)
    try {
      const children = await listChildren()
      const child =
        children.find(({ childId }) => String(childId) === selectedChildId) ??
        children[0]
      if (child) {
        setChildName(child.name)
        setPhoneNumber(child.phoneNumber ?? null)
      }
    } catch {
      setPhoneNumber(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="전화 걸기"
        className={className}
        onClick={() => void openCallModal()}
      >
        <img src={phoneIcon} className="h-6 w-6" alt="" />
      </button>
      <CallModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        childName={childName}
        phoneNumber={phoneNumber}
        isLoading={isLoading}
      />
    </>
  )
}
