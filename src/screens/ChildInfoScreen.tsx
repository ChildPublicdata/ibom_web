import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
}

export function ChildInfoScreen() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const isComplete =
    name.trim().length > 0 &&
    birthDate.length === 6 &&
    phoneNumber.replace(/\D/g, '').length === 11

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isComplete) navigate('/safe-place-setup')
  }

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-4 pb-6 pt-20 text-neutral-950">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.45] tracking-[-0.05em]">
          <span className="text-[#ff9800]">자녀의 정보</span>를
          <br />
          입력 해 주세요.
        </h1>
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

          <label className="block text-xs font-semibold">
            생년월일<span className="text-red-500">*</span>
            <input
              type="text"
              inputMode="numeric"
              value={birthDate}
              onChange={(event) =>
                setBirthDate(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="YYMMDD"
              autoComplete="bday"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition placeholder:text-neutral-400 focus:border-[#ffd54f]"
            />
          </label>

          <label className="block text-xs font-semibold">
            전화번호<span className="text-red-500">*</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(event) =>
                setPhoneNumber(formatPhoneNumber(event.target.value))
              }
              placeholder="-까지 입력 해 주세요"
              autoComplete="tel"
              className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm font-normal outline-none transition placeholder:text-neutral-400 focus:border-[#ffd54f]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!isComplete}
          className="mt-auto h-14 w-full rounded-[18px] bg-[#ffd54f] text-sm font-semibold text-neutral-950 transition disabled:bg-neutral-300 disabled:text-white"
        >
          완료
        </button>
      </form>
    </main>
  )
}
