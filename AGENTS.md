# ReelTrip 프론트엔드 규칙

이 파일은 ReelTrip 프론트엔드 레포의 작업 규칙이에요. 사람도, AI 코딩 도구(Codex, Claude Code 등)도 같은 규칙으로 일해요.

- 레포 루트에 `AGENTS.md`라는 이름으로 두면 Codex가 읽어요.
- Claude Code를 쓰는 사람은 루트에 `CLAUDE.md`를 만들고 `@AGENTS.md` 한 줄만 적으면 같은 내용을 읽어요.

## 프로젝트 요약

- **서비스:** 여행 릴스·유튜브·블로그 링크를 넣으면 AI가 장소 카드로 요약해요. 카드는 카테고리별 보관함에서 지도 위 노드로 보고, 여행계획은 일자별로 지도 위에서 노드를 골라 동선을 짜요.
- **기능명세서:** [docs/기능명세서.md](docs/기능명세서.md). 화면을 만들기 전에 해당 기능의 트리거·처리·예외를 먼저 확인해요.
- **화면 기준:** 모바일 390×844 (웹앱을 폰 크기로 시연)
- **스택:** React + TypeScript, 지도는 Google Maps, 배포는 Vercel
- **일정:** 결과물 제출 11/20 (금), 데모데이 11/22 (일). 예선은 배포 URL로 심사하므로 `main`은 항상 동작해야 해요.
- **FE 담당:** FE 1 (팀장) 여행계획 화면(지도 위 노드·동선)·공통 지도·공통 API 클라이언트·상태 관리·프론트 배포 / FE 2 홈·링크 추가, 카드 상세, 카테고리 보관함, 상태·예외 화면

### 지도에서 지킬 것

- 지도는 `shared/components/Map` 하나를 보관함과 여행계획이 같이 써요. 화면마다 따로 만들지 않아요.
- 교통·팁 카드는 지도에 노드로 놓지 않아요. 구역과 상관없이 적용 지역이 맞으면 하단 "꿀팁 보기" 같은 목록으로 보여줘요.
- 동선은 확정한 노드 순서대로 그려요. 플랜B는 다른 색으로 앞 노드에서 갈라져 다음 노드에서 합쳐져요.
- 다른 일자에 이미 들어간 노드는 회색으로 표시해요.

## AI 도구 응답 방식

팀원은 바쁘고 작업 과정을 다 지켜보지 않아요. 잠깐 자리를 비웠다 돌아온 동료에게 말하듯 답해 주세요.

- 한국어로, "~요" 체로 답해요.
- 첫 문장은 결과예요. 요청한 일이 됐는지, 무엇을 찾았는지를 먼저 말하고 설명은 그 뒤에 붙여요.
- 짧게 써요. 뜻을 더하지 않는 말("진짜", "솔직히", "중요한 점은")과 "이제 ~를 설명할게요" 같은 예고는 빼요.
- 쉬운 말로 써요. 전문용어는 꼭 필요할 때만 쓰고, 작업하면서 스스로 만든 이름이나 줄임말은 쓰지 않아요.
- 작업을 시작하기 전에 무엇을 할지 한 문장으로 말해요.
- 여러 선택지를 비교할 때는 표로 정리하고, 추천을 하나 골라 이유와 함께 말해요. 하지 않을 선택지를 길게 나열하지 않아요.
- 파일을 언급할 때는 `[Button.tsx](src/shared/components/Button/Button.tsx:12)`처럼 클릭할 수 있는 링크로 써요.
- 실패한 것, 건너뛴 것, 확인하지 못한 것은 숨기지 않고 그대로 말해요.
- 질문은 정말 막혔을 때만 해요. 이 파일이나 기존 코드로 정할 수 있는 건 정해서 진행하고, 무엇으로 정했는지 알려 줘요.
- 코드 주석도 같은 원칙이에요. 짧은 한국어로, 코드만 봐서는 알기 어려운 이유만 적어요.

### 답변 끝의 진행 상황 요약

파일을 고치거나 명령을 실행한 답변은 끝에 진행 상황을 짧게 정리해요. 질문에 바로 답하는 짧은 대화에는 붙이지 않아요.

- **지금 상태:** 무엇이 바뀌었고 어디까지 됐는지 2~3문장
- **남은 것:** 안 된 것, 확인 못 한 것 (커밋 안 함, 미리보기 URL에서 확인 안 함 등)
- **다음 할 일:** 이어서 해야 할 작업. 사용자가 정해야 할 게 있으면 질문 하나로 묻고 추천안을 먼저 적어요.

```
지금 상태: 보관함 화면에 카테고리 필터를 붙였고 가짜 데이터로 7개 카테고리 모두 확인했어요.
남은 것: 실제 GET /places 연결은 아직이고, 커밋하지 않았어요.
다음 할 일: 커밋할까요? (추천: feat: 보관함 카테고리 필터 추가 (#21))
```

## AI 도구 작업 규칙

- 커밋, 푸시, PR 생성은 요청받았을 때만 해요. 할 때는 아래 커밋·브랜치 규칙을 따라요.
- 새 패키지를 설치하기 전에 무엇을 왜 설치하는지 먼저 물어봐요.
- API 키는 코드에 직접 쓰지 않고 `.env`에만 둬요. `.env` 내용은 출력하지 않아요. `VITE_`로 시작하는 값은 브라우저에 그대로 노출된다는 점도 기억해요.
- 화면을 만들면 390×844 크기에서 확인해요. 로딩·실패·빈 화면도 같이 만들어요 (MVP 필수, 본선 안정성·예외 처리 점수).
- 공통 컴포넌트를 만들거나 고치면 `src/pages/ComponentTestPage/demos.tsx`에 상태별로 등록하고, `npm run dev` 후 `/dev/components`에서 확인해요. 이 페이지는 로컬 개발에서만 열리고 배포 URL에는 나오지 않아요.
- API 형식은 금요일 전체 회의에서 BE와 정한 것을 따라요. 정해지지 않은 부분은 가짜 데이터로 먼저 만들고, 가짜라는 걸 코드에 표시해요.

## 커밋 메시지

```
<type>: <무엇을 왜 바꿨는지> (#이슈번호)
```

```
feat: 링크 붙여넣기 후 분석 중 화면 추가 (#12)
fix: 플랜B 동선이 다음 노드에서 합쳐지지 않는 문제 수정 (#18)
```

| type | 쓰는 경우 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `design` | CSS·레이아웃 등 화면 모양만 변경 |
| `refactor` | 동작은 그대로 두고 코드 구조 개선 |
| `style` | 포매팅, 세미콜론 등 코드 의미가 바뀌지 않는 수정 |
| `remove` | 파일·코드·기능 삭제 |
| `chore` | 패키지 설치, 빌드·환경 설정, `.gitignore` 등 |
| `docs` | 문서 수정 |
| `test` | 테스트 코드 |

- 어떻게(how)보다 무엇(what)과 왜(why)를 적어요.
- 하나의 커밋에는 하나의 일만 담아요.

## 브랜치

| 브랜치 | 설명 |
| --- | --- |
| `main` | 배포 브랜치. Vercel이 자동 배포하고 이 URL을 제출해요. 직접 푸시하지 않고 PR로만 합쳐요. |
| `feature/#이슈번호-작업내용` | 작업 브랜치. 예: `feature/#12-link-input` |

- 작업 브랜치는 이슈 하나당 하나씩 만들어요.
- PR을 올리면 Vercel이 미리보기 URL을 만들어 줘요. 거기서 확인한 뒤 `main`에 합쳐요.
- PR은 다른 FE 한 명이 확인하고 합쳐요. 합친 브랜치는 삭제해요.
- 3주짜리 해커톤이라 `develop`, `release` 브랜치는 두지 않아요.

## 코드 규칙

### 이름 짓기

- 변수·함수는 카멜 케이스: `placeId`, `fetchPlaces`
- 컴포넌트와 컴포넌트 파일은 파스칼 케이스: `PlaceCard.tsx`
- 커스텀 훅은 `use`로 시작: `usePlan`
- 상수는 대문자 스네이크 케이스: `MAX_DAYS`, `CATEGORY_COLORS`
  - `const`로 선언했다고 모두 상수는 아니에요. 앱 어디서도 바뀌지 않는 값만 상수로 써요.
- Boolean은 `is`, `has`, `can`으로 시작하고 부정형은 피해요: `isLoading` (O), `isNotLoaded` (X)
- 함수 이름만 보고 무엇을 하는지 알 수 있게 지어요: `addNodeToDay`
- 전역 변수는 최소화해요. 한 함수에서만 쓰는 값은 그 함수 안에서 선언해요.

### 함수 정의

```tsx
// 컴포넌트는 함수 선언식
export default function PlaceCard() {}

// 컴포넌트 안의 함수는 화살표 함수
const handleDragEnd = () => {};
```

### TypeScript

- `any`는 쓰지 않아요. 타입을 모르면 `unknown`으로 받고 좁혀서 써요.
- 타입 파일은 `.d.ts`가 아니라 `.types.ts`로 만들어요.
- API 응답 타입은 BE와 정한 형식을 그대로 옮겨 적어요.

## 폴더 구조

```
src/
├── app/                        # 앱 초기화·설정
│   ├── providers/              # 앱 전체 프로바이더
│   ├── styles/index.css        # 전역 스타일
│   ├── main.tsx                # 진입점
│   └── App.tsx                 # 루트 컴포넌트
│
├── pages/                      # 라우팅 진입점 (index.tsx 대신 이름을 그대로 씀)
│   ├── HomePage/HomePage.tsx               # 홈·링크 추가
│   ├── PlaceDetailPage/PlaceDetailPage.tsx # 요약 카드 상세
│   ├── LibraryPage/LibraryPage.tsx         # 카테고리 보관함 (지도 위 노드)
│   ├── PlanCreatePage/PlanCreatePage.tsx   # 여행계획 생성 (여행명·기간·장소)
│   ├── PlanEditPage/PlanEditPage.tsx       # 여행계획 편집 (숙소·일자·구역 선택, 노드 확정)
│   ├── PlanViewPage/PlanViewPage.tsx       # 계획 완성 보기 (일자별 동선)
│   └── ComponentTestPage/                  # 컴포넌트 테스트 (/dev/components, 로컬 전용)
│       ├── ComponentTestPage.tsx
│       └── demos.tsx                       # 여기에 컴포넌트를 등록
│
├── features/                   # 기능 단위 모듈
│   ├── source/                 # 링크 등록과 분석 상태
│   │   ├── api/sources.ts      # POST /sources, GET /sources/{id}
│   │   ├── ui/LinkInput.tsx
│   │   └── model/
│   │       ├── useSourceStatus.ts
│   │       └── source.types.ts
│   │
│   ├── place/                  # 요약 카드
│   │   ├── api/places.ts       # GET /places, PATCH /places/{id}
│   │   ├── ui/
│   │   │   ├── PlaceCard.tsx
│   │   │   └── CategoryChip.tsx
│   │   ├── model/
│   │   │   ├── usePlaces.ts
│   │   │   └── place.types.ts
│   │   └── lib/categories.ts   # 카테고리 7개와 색·아이콘
│   │
│   └── plan/                   # 여행계획
│       ├── api/plans.ts        # GET /plans/{id}, PUT /plans/{id}
│       ├── ui/
│       │   ├── DaySelector.tsx     # 상단 일자 선택
│       │   ├── ZoneSelector.tsx    # 여행 구역 선택
│       │   ├── PlanRoute.tsx       # 지도 위 동선·플랜B 분기
│       │   └── TipList.tsx         # 교통·팁 카드 목록 (지도에 안 올림)
│       └── model/
│           ├── usePlan.ts
│           └── plan.types.ts
│
├── shared/                     # 여러 기능이 같이 쓰는 것
│   ├── api/client.ts           # 공통 API 클라이언트 (기본 주소, 에러 처리)
│   ├── components/             # 기본 UI 컴포넌트
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Header/
│   │   ├── Map/                # Google Maps 공통 지도와 노드 마커 (보관함·여행계획이 같이 씀)
│   │   └── StatusView/         # 로딩·실패·빈 화면 공통 컴포넌트
│   ├── hooks/
│   ├── lib/
│   └── types/global.types.ts
│
└── router/
    ├── index.tsx               # 라우터 설정
    └── routes.tsx              # 라우트 정의
```

- `widgets`는 쓰지 않아요. 작은 UI 단위는 `shared/components`에 둬요.
- 비즈니스 로직은 각 기능 폴더의 `model`에 둬요. `entities` 폴더는 쓰지 않아요.
- 로그인은 MVP에서 빠졌으니 `auth` 폴더는 만들지 않아요.

## 이슈·PR 템플릿

`.github/ISSUE_TEMPLATE/`과 `.github/pull_request_template.md`에 넣어요.

### 버그 이슈

```markdown
---
name: 버그
about: 버그 신고
title: '[버그] '
labels: bug
---

## 무슨 문제인가요

## 재현 방법
1.
2.

## 기대한 동작

## 스크린샷·환경
<!-- 기기, 브라우저, 배포 URL인지 로컬인지 -->
```

### 기능 이슈

```markdown
---
name: 기능
about: 만들 기능
title: '[기능] '
labels: enhancement
---

## 만들 것

## 할 일
- [ ]
- [ ]

## 참고
<!-- 피그마 화면, 기능 명세, API -->
```

### PR

```markdown
## 무엇을 했나요

## 스크린샷
<!-- 390×844 기준. 화면 변경이 없으면 지워 주세요 -->

## 체크리스트
- [ ] 커밋 메시지 규칙을 지켰어요
- [ ] Vercel 미리보기 URL에서 동작을 확인했어요
- [ ] 로딩·실패·빈 화면을 확인했어요 (해당되는 경우)

resolves #
```
