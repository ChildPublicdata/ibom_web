import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { redeemFamilyCode } from '@/lib/familyApi'

export function FamilyCodeInputScreen() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [connectedChild, setConnectedChild] = useState('')

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code.length !== 6) return
    setIsSubmitting(true)
    setError('')
    try {
      const response = await redeemFamilyCode(code)
      setConnectedChild(response.childName)
    } catch (redeemError) {
      setError(
        redeemError instanceof Error
          ? redeemError.message
          : '가족을 연결하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-5 pb-6 pt-28 text-slate-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold leading-snug">
          <span className="text-[#3b82f6]">가족 코드</span>를
          <br />
          입력해 주세요!
        </h1>
        <p className="mt-3 text-xs text-slate-400">
          자녀 기기에 표시된 6자리 숫자 코드입니다.
        </p>
      </div>
      {connectedChild ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-lg font-semibold">
            {connectedChild} 자녀와 연결되었어요!
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-1 flex-col pt-24">
          <input
            aria-label="6자리 가족 코드"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className="h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[0.25em] outline-none focus:border-[#ffd54f]"
          />
          {error && (
            <p className="mt-3 text-center text-xs text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={code.length !== 6 || isSubmitting}
            className="mt-auto h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold disabled:bg-neutral-300 disabled:text-white"
          >
            {isSubmitting ? '연결 중...' : '완료'}
          </button>
        </form>
      )}
      {connectedChild && (
        <button
          type="button"
          onClick={() => navigate('/safe-place-setup')}
          className="h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold"
        >
          확인
        </button>
      )}
    </main>
  )
}
