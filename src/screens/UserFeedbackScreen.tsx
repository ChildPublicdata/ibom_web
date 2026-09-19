import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import headerLogo from '@/assets/header-logo.svg'
import emptyIllustration from '@/assets/illustrations/user-feedback-empty.svg'
import feedbackImageIcon from '@/assets/icons/feedback-image.svg'
import feedbackLinkIcon from '@/assets/icons/feedback-link.svg'
import feedbackAddIcon from '@/assets/icons/feedback-add.svg'
import feedbackSuccessIcon from '@/assets/icons/feedback-success.svg'
import { BottomNavigation } from '@/components/BottomNavigation'
import { PhoneCallButton } from '@/components/CallModal'
import { NotificationButton } from '@/components/NotificationButton'
import { getAuthSession } from '@/lib/authStorage'

type Feedback = {
  id: string
  title: string
  content: string
  link?: string
  createdAt: string
}

type ScreenMode = 'list' | 'compose' | 'complete'

const storageKey = () =>
  `ibom:${getAuthSession()?.userId ?? 'guest'}:user-feedback`

function loadFeedback() {
  try {
    return JSON.parse(localStorage.getItem(storageKey()) ?? '[]') as Feedback[]
  } catch {
    return []
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function UserFeedbackScreen() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<ScreenMode>('list')
  const [feedback, setFeedback] = useState<Feedback[]>(loadFeedback)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [link, setLink] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageName, setImageName] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const canSubmit = title.trim().length > 0 && content.trim().length > 0
  const contentLength = useMemo(() => content.length, [content])

  const openComposer = () => {
    setTitle('')
    setContent('')
    setLink('')
    setImageName('')
    setImagePreview('')
    setShowLinkInput(false)
    setMode('compose')
  }

  const submit = () => {
    if (!canSubmit) return
    const next = [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        link: link.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      ...feedback,
    ]
    localStorage.setItem(storageKey(), JSON.stringify(next))
    setFeedback(next)
    setMode('complete')
  }

  const removeFeedback = (id: string) => {
    const next = feedback.filter((item) => item.id !== id)
    localStorage.setItem(storageKey(), JSON.stringify(next))
    setFeedback(next)
  }

  return (
    <main className="relative flex min-h-[100svh] w-full max-w-[390px] flex-col overflow-hidden bg-white text-neutral-950">
      {mode === 'complete' ? (
        <section className="flex min-h-0 flex-1 flex-col px-5 pb-5 text-center">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <img
              src={feedbackSuccessIcon}
              alt=""
              className="h-28 w-28 object-contain"
            />
            <h1 className="mt-10 text-xl font-bold leading-7">
              이용자 의견이
              <br />
              전달되었어요!
            </h1>
            <p className="mt-3 text-xs text-neutral-400">
              소중한 의견 감사해요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode('list')}
            className="mt-4 h-12 w-full shrink-0 rounded-xl bg-main-yellow text-sm font-semibold"
          >
            확인
          </button>
        </section>
      ) : (
        <>
          <header className="relative z-10 bg-white px-5 pb-3 pt-5">
            {mode === 'list' && (
              <div className="flex h-10 items-center justify-between">
                <img src={headerLogo} alt="아이봄" className="h-7 w-auto" />
                <div className="flex items-center gap-5">
                  <PhoneCallButton />
                  <NotificationButton className="h-[22px] w-[22px]" />
                </div>
              </div>
            )}
            <div className={mode === 'list' ? 'mt-2 flex items-center' : 'flex h-10 items-center'}>
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() =>
                  mode === 'compose' ? setMode('list') : navigate(-1)
                }
                className="mr-5 text-2xl font-light leading-none text-slate-600"
              >
                ‹
              </button>
              {mode === 'list' && (
                <h1 className="text-lg font-bold tracking-[-0.04em]">
                  이용자 의견
                </h1>
              )}
            </div>
          </header>

          {mode === 'compose' ? (
            <section className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-5 pt-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                placeholder="제목을 입력하세요."
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-xs shadow-[0_2px_5px_rgba(15,23,42,0.10)] outline-none focus:border-main-yellow"
              />
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-neutral-200 p-4 shadow-[0_2px_5px_rgba(15,23,42,0.10)] focus-within:border-main-yellow">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={1500}
                  placeholder="내용을 작성해 주세요."
                  className="min-h-0 flex-1 resize-none text-xs leading-5 outline-none"
                />
                {imagePreview && (
                  <div className="relative mb-3 w-full overflow-hidden rounded-lg bg-neutral-50">
                    <img
                      src={imagePreview}
                      alt={imageName || '첨부 이미지'}
                      className="max-h-44 w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="첨부 이미지 삭제"
                      onClick={() => {
                        setImageName('')
                        setImagePreview('')
                      }}
                      className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-sm text-white"
                    >
                      ×
                    </button>
                  </div>
                )}
                {showLinkInput && (
                  <input
                    type="url"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    placeholder="관련 링크를 입력하세요."
                    className="mb-2 h-9 rounded-lg border border-neutral-200 px-3 text-[10px] outline-none focus:border-main-yellow"
                  />
                )}
                <div className="flex items-center gap-4 text-neutral-500">
                  <button
                    type="button"
                    aria-label="사진 첨부"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-7 w-7 place-items-center"
                  >
                    <img src={feedbackImageIcon} alt="" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="링크 첨부"
                    onClick={() => setShowLinkInput((visible) => !visible)}
                    className="grid h-7 w-7 place-items-center"
                  >
                    <img src={feedbackLinkIcon} alt="" className="h-5 w-5" />
                  </button>
                  <span className="ml-auto text-[10px] text-neutral-400">
                    {contentLength}/1500자
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      setImageName(file.name)
                      const reader = new FileReader()
                      reader.onload = () =>
                        setImagePreview(
                          typeof reader.result === 'string'
                            ? reader.result
                            : '',
                        )
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={submit}
                className="h-12 rounded-xl bg-main-yellow text-xs font-semibold disabled:bg-neutral-300 disabled:text-white"
              >
                사용자 의견 전달하기
              </button>
            </section>
          ) : (
            <section className="relative min-h-0 flex-1 px-5 py-5">
              {feedback.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center pb-20 text-center">
                  <img
                    src={emptyIllustration}
                    alt=""
                    className="h-48 w-48 object-contain"
                  />
                  <h2 className="mt-4 text-xl font-bold leading-7">
                    이용자 의견을
                    <br />
                    알려주세요.
                  </h2>
                  <p className="mt-3 text-xs text-neutral-400">
                    알려주신 의견은 안양시로 전달됩니다.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {feedback.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-neutral-200 px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {item.title}
                          </p>
                          <p className="mt-3 text-[10px] text-neutral-500">
                            {formatDate(item.createdAt)} 작성
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="의견 삭제"
                          title="삭제"
                          onClick={() => removeFeedback(item.id)}
                          className="px-1 text-xl leading-none"
                        >
                          ⋮
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                aria-label="이용자 의견 작성"
                onClick={openComposer}
                className="absolute bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full border border-neutral-200 bg-white shadow-lg"
              >
                <img
                  src={feedbackAddIcon}
                  alt=""
                  className="h-9 w-9 translate-x-[1px] -translate-y-[1px]"
                />
              </button>
            </section>
          )}
        </>
      )}
      {mode === 'list' && <BottomNavigation active="menu" />}
    </main>
  )
}
