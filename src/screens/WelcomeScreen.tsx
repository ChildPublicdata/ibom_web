import { Link } from 'react-router-dom'
import welcomeIllustration from '@/assets/onboarding/welcome-illustration.svg'

export function WelcomeScreen() {
  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-6 pb-5 pt-24">
      <section className="flex flex-1 flex-col items-center text-center">
        <img
          alt="아이봄 친구들"
          className="w-[182px]"
          src={welcomeIllustration}
        />
        <h1 className="mt-10 text-2xl font-bold leading-snug tracking-[-0.04em] text-slate-950">
          아이봄에 오신 걸
          <br />
          환영해요!
        </h1>
        <p className="mt-3 text-xs text-slate-400">
          이제 아이의 위치를 빠르고 쉽게 확인해 보세요.
        </p>
      </section>
      <Link
        className="flex h-10 items-center justify-center rounded-xl bg-[#ffd54f] text-xs font-semibold text-slate-950 transition hover:bg-[#ffca28]"
        to="/user-select"
      >
        시작하기
      </Link>
    </main>
  )
}
