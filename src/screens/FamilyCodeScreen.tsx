import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function createFamilyCode() {
  return Array.from({ length: 8 }, () =>
    CODE_CHARACTERS.charAt(Math.floor(Math.random() * CODE_CHARACTERS.length)),
  ).join('')
}

export function FamilyCodeScreen() {
  const navigate = useNavigate()
  const familyCode = useMemo(() => createFamilyCode(), [])

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-4 pb-6 pt-20 text-neutral-950">
      <div className="text-center">
        <h1 className="text-[28px] font-bold leading-[1.45] tracking-[-0.05em]">
          <span className="text-[#3b82f6]">가족 코드</span>가
          <br />
          생성되었어요!
        </h1>
        <p className="mt-3 text-xs text-neutral-400">
          가족 코드를 통해서 가족과 연결될 수 있어요.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center pb-14">
        <button
          aria-label="가족 코드 복사"
          className="relative rounded-full px-8 py-4 text-[34px] font-semibold tracking-[0.02em]"
          onClick={() => void navigator.clipboard?.writeText(familyCode)}
          type="button"
        >
          <span className="absolute inset-0 -z-0 rounded-full bg-sky-200/70 blur-xl" />
          <span className="relative">{familyCode}</span>
        </button>
      </div>

      <button
        className="h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold text-neutral-950"
        onClick={() => navigate('/safe-place-setup')}
        type="button"
      >
        확인
      </button>
    </main>
  )
}
