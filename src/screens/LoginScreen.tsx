import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import headerLogo from '@/assets/header-logo.svg'
import { login } from '@/lib/authApi'
import { saveAuthSession } from '@/lib/authStorage'
import { useAppStore } from '@/store/useAppStore'

export function LoginScreen() {
  const navigate = useNavigate()
  const selectedRole = useAppStore((state) => state.selectedRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const session = await login(email, password)
      if (selectedRole && session.role !== selectedRole) {
        setError(
          session.role === 'PARENT'
            ? '부모 계정입니다. 부모로 선택해 주세요.'
            : '자녀 계정입니다. 자녀로 선택해 주세요.',
        )
        return
      }
      saveAuthSession(session)
      navigate(session.role === 'CHILD' ? '/home' : '/family-code-input', {
        replace: true,
      })
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : '로그인하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-5 pb-6 pt-24 text-slate-950">
      <div className="flex flex-1 flex-col justify-center">
        <img src={headerLogo} alt="아이봄" className="mx-auto h-12 w-auto" />
        <form onSubmit={submit} className="mt-12 space-y-5">
          <label className="block text-xs font-semibold">
            이메일
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none focus:border-[#ffd54f]"
            />
          </label>
          <label className="block text-xs font-semibold">
            비밀번호
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none focus:border-[#ffd54f]"
            />
          </label>
          {error && <p className="text-center text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!email || !password || isSubmitting}
            className="h-12 w-full rounded-xl bg-[#ffd54f] text-sm font-semibold disabled:bg-neutral-300 disabled:text-white"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate('/parent-signup')}
          className="mt-4 text-xs text-slate-400 underline"
        >
          회원가입
        </button>
      </div>
    </main>
  )
}
