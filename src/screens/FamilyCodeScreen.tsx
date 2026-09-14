import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { issueFamilyCode } from '@/lib/familyApi'

export function FamilyCodeScreen() {
  const navigate = useNavigate()
  const requested = useRef(false)
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    issueFamilyCode()
      .then((response) => {
        setCode(response.code)
        setExpiresAt(response.expiresAt)
      })
      .catch((issueError) =>
        setError(
          issueError instanceof Error
            ? issueError.message
            : '가족 코드를 발급하지 못했습니다.',
        ),
      )
  }, [])

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-4 pb-6 pt-20 text-neutral-950">
      <div className="text-center">
        <h1 className="text-[28px] font-bold leading-[1.45] tracking-[-0.05em]">
          <span className="text-[#3b82f6]">가족 코드</span>가
          <br />
          생성되었어요!
        </h1>
        <p className="mt-3 text-xs text-neutral-400">
          이 코드를 부모님 기기에 입력해 주세요.
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center pb-14">
        {code && (
          <button
            aria-label="가족 코드 복사"
            className="relative rounded-full px-8 py-4 text-[34px] font-semibold tracking-[0.12em]"
            onClick={() => void navigator.clipboard?.writeText(code)}
            type="button"
          >
            <span className="absolute inset-0 -z-0 rounded-full bg-sky-200/70 blur-xl" />
            <span className="relative">{code}</span>
          </button>
        )}
        {!code && !error && (
          <p className="text-sm text-slate-400">코드를 발급하고 있어요...</p>
        )}
        {expiresAt && (
          <p className="mt-5 text-xs text-slate-400">
            10분 이내에 입력해 주세요.
          </p>
        )}
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>
      <button
        className="h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold"
        onClick={() => navigate('/home')}
        type="button"
      >
        확인
      </button>
    </main>
  )
}
