import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '@/lib/authApi'
import { saveAuthSession } from '@/lib/authStorage'
import { useAppStore } from '@/store/useAppStore'

export function ChildInfoScreen() {
  const navigate = useNavigate()
  const selectedRole = useAppStore((state) => state.selectedRole)
  const signupDraft = useAppStore((state) => state.signupDraft)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isComplete = name.trim().length > 0

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isComplete || !signupDraft || !selectedRole) return
    setIsSubmitting(true)
    setError('')
    try {
      const session = await signup({
        ...signupDraft,
        name: name.trim(),
        role: selectedRole,
      })
      saveAuthSession(session)
      navigate(
        session.role === 'CHILD' ? '/family-code' : '/family-code-input',
        { replace: true },
      )
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : '회원가입하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-4 pb-6 pt-20 text-neutral-950">
      <div>
        <h1 className="text-center text-[28px] font-bold leading-[1.45] tracking-[-0.05em]">
          <span className="text-[#ff9800]">내 정보</span>를
          <br />
          입력해 주세요!
        </h1>
        <p className="mt-3 text-center text-xs text-neutral-400">
          {selectedRole === 'CHILD'
            ? '자녀 계정에서 사용할 이름을 입력해 주세요.'
            : '부모 계정에서 사용할 이름을 입력해 주세요.'}
        </p>
        <p className="mt-4 text-right text-[10px] text-[#ff6b6b]">
          *은 필수 입력 항목입니다
        </p>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-1 flex-col">
        <div className="space-y-5">
          <label className="block text-xs font-semibold">
            이름<span className="text-red-500">*</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition focus:border-[#ffd54f]"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 text-center text-xs text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={
            !isComplete || !signupDraft || !selectedRole || isSubmitting
          }
          className="mt-auto h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold text-neutral-950 transition disabled:bg-neutral-300 disabled:text-white"
        >
          {isSubmitting ? '가입 중...' : '완료'}
        </button>
      </form>
    </main>
  )
}
