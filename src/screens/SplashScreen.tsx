import { Link } from 'react-router-dom'
import splashBackground from '@/assets/onboarding/splash-bg.svg'

export function SplashScreen() {
  return (
    <Link
      aria-label="아이봄 시작하기"
      className="relative flex min-h-[100svh] w-full max-w-[390px] overflow-hidden bg-[#ffdc91]"
      to="/welcome"
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        src={splashBackground}
      />
      <span className="sr-only">화면을 눌러 시작하기</span>
    </Link>
  )
}
