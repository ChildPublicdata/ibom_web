# ibom

아이의 위치, 안심존, 안전 경로를 지원하는 지도 기반 서비스의 프런트엔드입니다.

## 기술 스택

- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- React Router v6, Zustand, TanStack Query
- 카카오맵 JavaScript SDK 연동 준비

## 시작하기

```bash
npm install
cp .env.example .env
# .env에 VITE_KAKAO_MAP_KEY를 입력
npm run dev
```

기본 개발 서버 주소는 `http://localhost:5173`입니다.

## 주요 명령어

```bash
npm run dev
npm run build
npm run lint
npm run format:check
```

## 디렉터리

- `src/screens`: Welcome, UserSelect, SafePlaceSetup, SafeZoneSetup, Home, SafeRoute, Hospital, SafetyAlert 등의 화면 컴포넌트
- `src/components`: 지도, 반경 슬라이더, 토글 카드 등 공통 UI
- `src/store`: Zustand 전역 상태
- `src/hooks`: 커스텀 훅
- `src/lib`: 유틸리티와 API 클라이언트
- `src/types`: 공통 타입
- `src/routes`: 라우터 설정
