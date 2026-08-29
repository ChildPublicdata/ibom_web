import { useNavigate } from 'react-router-dom'
import childCharacter from '@/assets/onboarding/character-child.svg'
import parentCharacter from '@/assets/onboarding/character-parent.svg'

type UserRole = 'child' | 'parent'

const options: { role: UserRole; title: string; image: string }[] = [
  { role: 'child', title: '자녀', image: childCharacter },
  { role: 'parent', title: '부모', image: parentCharacter },
]

export function UserSelectScreen() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-5 pb-5 pt-24">
      <section>
        <p className="text-xs text-slate-400">
          아이봄을 사용하기 전, 기본 정보가 필요해요.
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-snug tracking-[-0.04em] text-slate-950">
          이 스마트폰은
          <br />
          <span className="text-[#ff9800]">누가</span> 사용중인가요?
        </h1>
      </section>

      <div className="mt-12 grid grid-cols-2 gap-3">
        {options.map(({ role, title, image }) => {
          return (
            <button
              className={`flex aspect-[0.82] flex-col items-center justify-between rounded-[30px] border pt-5 shadow-[0_3px_4px_rgba(0,0,0,0.18)] transition ${
                role === 'child' ? 'bg-[#fff9ee]' : 'bg-[#ffd54f]'
              } border-black/5 hover:-translate-y-0.5`}
              key={role}
              onClick={() =>
                navigate(role === 'parent' ? '/child-info' : '/home')
              }
              type="button"
            >
              <span className="text-base font-semibold text-slate-950">
                {title}
              </span>
              <img
                alt=""
                className="w-full max-w-[155px] object-contain"
                src={image}
              />
            </button>
          )
        })}
      </div>
    </main>
  )
}
