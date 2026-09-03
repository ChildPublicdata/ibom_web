import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
}

export function ParentSignupScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const isComplete =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    phoneNumber.replace(/\D/g, '').length === 11

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isComplete) navigate('/child-info')
  }

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-4 pb-6 pt-20 text-neutral-950">
      <div>
        <h1 className="text-center text-[28px] font-bold leading-[1.45] tracking-[-0.05em]">
          아이봄에
          <br />
          <span className="text-[#ff9800]">가입해 주세요!</span>
        </h1>
        <p className="mt-3 text-center text-xs text-neutral-400">
          아이봄을 사용하려면 회원가입이 필요해요.
        </p>
        <p className="mt-3 text-right text-[10px] text-[#ff6b6b]">
          *은 필수 입력 항목입니다
        </p>
      </div>

      <form className="mt-3 flex flex-1 flex-col" onSubmit={submit}>
        <div className="space-y-5">
          <label className="block text-xs font-semibold">
            이메일<span className="text-red-500">*</span>
            <input
              autoComplete="email"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition placeholder:text-neutral-400 focus:border-[#ffd54f]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-mail"
              type="email"
              value={email}
            />
          </label>

          <label className="block text-xs font-semibold">
            비밀번호<span className="text-red-500">*</span>
            <input
              autoComplete="new-password"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition placeholder:text-neutral-400 focus:border-[#ffd54f]"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="6자 이상 입력해 주세요"
              type="password"
              value={password}
            />
          </label>

          <label className="block text-xs font-semibold">
            전화번호<span className="text-red-500">*</span>
            <input
              autoComplete="tel"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition placeholder:text-neutral-400 focus:border-[#ffd54f]"
              inputMode="numeric"
              onChange={(event) =>
                setPhoneNumber(formatPhoneNumber(event.target.value))
              }
              placeholder="-까지 입력해 주세요"
              type="tel"
              value={phoneNumber}
            />
          </label>
        </div>

        <button
          className="mt-auto h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold text-neutral-950 transition disabled:bg-neutral-300 disabled:text-white"
          disabled={!isComplete}
          type="submit"
        >
          완료
        </button>
      </form>
    </main>
  )
}
