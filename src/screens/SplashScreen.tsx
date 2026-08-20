import { Link } from 'react-router-dom'
import logo from '@/assets/logo.svg'
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
      <img
        alt="아이봄"
        className="absolute left-1/2 top-[20%] w-[172px] -translate-x-1/2 brightness-0 invert"
        src={logo}
      />
      <span className="sr-only">화면을 눌러 시작하기</span>
    </Link>
  )
}
