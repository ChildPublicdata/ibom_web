import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import familyConnectedIllustration from '@/assets/onboarding/family-connected.svg'

type FamilyConnectedState = {
  childName?: string
}

export function FamilyConnectedScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { childName } = (state ?? {}) as FamilyConnectedState

  if (!childName) return <Navigate to="/family-code-input" replace />

  return (
    <main className="flex min-h-[100svh] w-full max-w-[390px] flex-col bg-white px-5 pb-6 pt-[110px] text-slate-950">
      <section className="flex flex-1 flex-col items-center text-center">
        <h1 className="text-2xl font-bold leading-[1.45] tracking-[-0.04em]">
          <span className="text-point-blue">{childName}</span>님과
          <br />
          가족으로 연결되었어요!
        </h1>

        <img
          src={familyConnectedIllustration}
          alt="가족 연결 완료"
          className="mt-12 h-[190px] w-[240px] object-contain"
        />

        <p className="mt-9 text-xs text-neutral-400">
          이제 가족의 위치를 알 수 있어요!
        </p>
      </section>

      <button
        type="button"
        onClick={() => navigate('/safe-place-setup', { replace: true })}
        className="h-14 w-full rounded-[18px] bg-main-yellow text-sm font-semibold"
      >
        확인
      </button>
    </main>
  )
}
