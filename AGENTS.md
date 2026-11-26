# 포트폴리오 웹사이트 — 작업 안내 (AI 에이전트 공통)

이 파일은 Codex · Claude 등 AI 에이전트가 이 폴더에서 작업을 이어 갈 때 읽는 안내다.
2026-11-24 Claude Code 대화에서 정한 내용을 옮겨 적었다. 대화 기록은 넘어오지 않으니 이 파일과 `reference/` 가 기준이다.

## 답변 규칙

- 사용자에게 하는 답변은 모두 **한국어**로 한다.
- "어떻게 하면 좋을까?" 같은 질문에는 제안만 하고, 구현은 사용자가 해 달라고 할 때 한다.
- 커밋 · 푸시는 사용자가 요청할 때만 한다.

## 목표

SSAFY 에서 한 프로젝트 3개를 담은 개인 포트폴리오 웹사이트.

| 프로젝트 | 설명 | 비중 |
|---|---|---|
| **동글서울** | 실제 서울 지도를 옮긴 3D 멀티플레이 생활 게임 (Three.js) | 메인 |
| **공구한** | 공동구매 웹사이트 | 보조 |
| **패밀링크** | AI 안부전화 앱 서비스 | 보조 |

## 디자인

- **고정된 디자인 규칙은 없다. 그때그때 사용자가 말한 대로 따른다.**
  지금 흰 바탕 · 검정 글씨 · Noto Sans KR 인 것은 처음에 구성만 보려고 그렇게 한 것일 뿐, 지켜야 할 규칙이 아니다.
- 동글서울 3D 스타일을 참고하고 싶으면 [reference/dongle-seoul-threejs-style.md](reference/dongle-seoul-threejs-style.md).

## 지금 만드는 것 = 장표형 포트폴리오 (`index.html`)

2026-11-25 방향을 바꿨다. 3D 책상 사이트는 `3d-desk/` 로 빼 두었다 (보관용, 지금은 손대지 않음).

- **1440 × 900 장표 25장**을 한 HTML 에 넣었다. ← → · 스페이스 · 아래 버튼 · 스와이프, 주소 끝 `#5` = 5번째 장.
- **PDF 만들기**: Ctrl+P → "PDF로 저장" → 여백 "없음" → "배경 그래픽" 켜기. 한 장 = 한 페이지.
- 스타일: 참고 PDF(`Downloads/포트폴리오_작성가이드_및_참고_포트폴리오/참고_포트폴리오_3.pdf`)구성 참고, Pretendard. 색은 11-25 사용자 지시로 **흰 배경 · 글자 #333** (포인트 네이비 `#1e448f`, 11-26 민트에서 바꾸고 조금 밝게).
- **노란 글씨 · 노란 점선 상자 = 아직 채울 곳.** 이미지는 `assets/` (원본: `Desktop/portfolio1/assets` · `Desktop/portfolio-projects/`).

### 방향 (11-25 사용자 지시)

- 예전 포트폴리오 `Desktop/portfolio1` (디자이너 · 퍼블리셔 관점)에서 **디자인 작업물(포스터 · 배너 등)은 빼고 SSAFY IT 개발 프로젝트만** 가져왔다.
- 동글서울이 메인이지만, 전체는 **"나(강다영)의 개발 스타일" 소개 → 프로젝트 소개**. 기획 설명처럼 길게 쓰지 말고 간결하게.
- 개발 스타일 3가지: ① 화면은 설계(Figma)부터 구현까지 ② 감이 아니라 측정으로 ③ AI 에이전트와 빠르게, 판단은 직접.
- 사람 정보 · 역할 · 기간 · 팀 구성은 `portfolio1` 의 `index.html` · `project-*.html` 에 있다. 거기 없는 건 지어내지 말 것.

### 장표 순서

참고 PDF 페이지 구성 그대로 (11-25 사용자 지시):
1 표지 · 2 프로필(사진 · 인사말 · 연락처) · 3 Awards · 4 Experience · 5 Tech Stack(점 5칸 + 사용 프로젝트 + 할 수 있는 것) ·
6 Education · Languages · 7 Projects 목록 · 8 동글서울 표지 · 9 3D 월드(OSM 도로망 흐름 5단계 + 전/후 캡처 자리, 11-26) · 10 로딩 성능 · 11 트러블슈팅(하늘색 화면) · 12 동글서울 그 밖에 한 일(11-26 추가, 프론트 관련만) · 13 동글서울 UI 한눈에(화살표 + 가운데 사진 `ui-before.png` → `ui-after.png` 페이드, 인쇄 땐 after) · 14 동글서울 UI 자세히(3칸: 시계 + 주민 목록 `ui-clock.gif` (102403 9초부터) · 채팅 `ui-chat.png` · 지도 `ui-map.gif`) ·
15 공구한 · 16 공구한 UX(다음 행동이 보이는 화면: 홈 상품 우선 676a704 · 판매자 전환 단계 90e5d65/aee25be · 주문/참여 현황 건별 카드 · 상세 분리 69311ca (a4a3503 의 4칸 요약은 69311ca 에서 본인이 뺐으므로 쓰지 말 것). 3번 화면은 시연영상.mp4 93초 캡처 `ggh-orders.jpg`) · 17 공구한 캐러셀 구현(브라우저 동작 · 접근성 중심 카드 4장: rAF→타이머, 이중 페이드 800→400ms, Chrome calc 곱셈 무시 → JS 실측, WCAG 2.2.2 멈춤 · reduced-motion. 근거 HomeBanner.tsx · global.css b47a34c) · 18 공구한 트러블슈팅(배포 뒤 상품 상세 404 → index.html no-store · assets 1년 캐시, 커밋 1cc06ca. 역할 2장은 `archive/gonggu-role-slides-1126.html`) · 19 패밀링크(표지 사진: 앱 시작 · 피드 · 마이페이지) · 20 패밀링크 AI 전화(휴대폰 3대 슬라이드쇼) · 21 패밀링크 트러블슈팅(통화 리포트 4건 이상 가로 스크롤 중첩 → 3열 줄바꿈, 커밋 c982d6f · 147b325. 역할 2장은 `archive/familink-role-slides-1126.html`) · 22 패밀링크 이미지 표시(알림 프로필 사진 파서 누락 c58fa26 + 종류 아이콘 506bbe5. 이미지 캐시 자체는 장대산 d5c95a0 — 내 것이라 쓰지 말 것) · 23 Blind Dating · 24 Blind Dating 스와이프 제스처(QuestionsView.vue, 강다영 커밋 feec27b · 31f2f7f · 3963a21. 저장소 `Desktop/portfolio1/blind_dating`. Pinia 는 예제만 있고 안 씀, axios api.js · 백엔드 연동 · ProfileView 는 최영우 — 쓰지 말 것) · 25 강점
- 자격증은 뺐다. 빠진 "개발 스타일 3가지" 장 · 이전 기술 표 등은 `archive/slides-before-1125-resume.html` 에 보관.
- Tech Stack 5개(11-26 JavaScript 추가) 점 개수(Three.js 4 · JavaScript 4 · React 4 · RN 3 · Vue 3)는 AI가 임시로 정한 값 → 사용자 확인 필요.

컨설턴트 가이드: 제일 잘한 것 먼저 · 프로젝트 요약 2~3줄 · 기술은 도표로 · 꼬리 질문 준비 · 마지막에 강점 · 자신 있게.

### 공구한 · 패밀링크 역할 (11-25 저장소 커밋으로 확인)

- 공구한 `Desktop/S15P21B205`: 프론트 **2명** (1인 아님). 구매자 · 판매자 화면, 디자인 시스템, 로그인 유지(토큰 재발급 — 프론트 처리), 배포 캐시 문제. 백엔드 작업은 안 함 (11-26 사용자). AI 분석 연동은 다른 팀원.
- 패밀링크 `Desktop/S15P11B104`: 프론트 코드 약 31% (팀 1위). Kotlin 은 AI 전화 화면 UI(Compose)만 — 통화 기능 자체는 다른 팀원.
- 예전 portfolio1 의 "실기기 뒤로가기 튕김" 이야기는 커밋에서 확인 못 함 → 장표에서 뺐다.
- 자세한 근거 · 꼬리 질문: `reference/interview-qa.md`

### 숫자 규칙

- 장표의 숫자는 전부 `reference/dongle-seoul-role.md` "측정값" 과 MR 기록에서 온 것. **새 숫자를 지어내지 말 것.**
- 기술 스택 그래프 % = 동글서울 저장소에서 kdyarchive 커밋의 추가 줄을 확장자별로 센 값 (json 데이터 제외).

## 동글서울 참고 자료 (`reference/`)

| 파일 | 내용 |
|---|---|
| [dongle-seoul-role.md](reference/dongle-seoul-role.md) | 맡은 역할 · 한 일 · 숫자 · 포트폴리오에 쓸 이야기 (여기부터 읽기) |
| [dongle-seoul-mr-list.md](reference/dongle-seoul-mr-list.md) | 병합된 MR 407개 (날짜순 · Jira 키) |
| [dongle-seoul-commits.md](reference/dongle-seoul-commits.md) | 커밋 목록 (날짜순) |
| [dongle-seoul-recording-list.md](reference/dongle-seoul-recording-list.md) | 서버 닫히기 전 녹화할 장면 목록 (번호 · 우선순위 · 찍는 순서) |
| [dongle-seoul-threejs-style.md](reference/dongle-seoul-threejs-style.md) | 동글서울 Three.js 스타일 (렌더러 · 조명 · 재질 · 색 · 캐릭터 · 카메라 · UI) |
| [interview-qa.md](reference/interview-qa.md) | 담당 역할별 면접 꼬리 질문과 답 뼈대 |
| [dongle-seoul-source/](reference/dongle-seoul-source/) | 원본 사본: `toon.js` (툰 재질) · `roundedBox.js` (둥근 상자) · `ui-DESIGN.md` · `vehicle-visual-style-spec.md` |

- 한 줄 역할: "실제 서울 지리 데이터 기반 3D 월드 구축 및 렌더링 성능 최적화 담당 (Three.js)".
- 로딩 수치는 MR별 전 / 후 값만 있다 (role.md "측정값"). 이어 붙인 총 시간은 없음.
- 원본 팀 저장소: `C:/Users/SSAFY/Desktop/S15P31B206` (참고만 하고 여기서 고치지 말 것).

## 다른 자료 위치 (이 PC)

- `C:/Users/SSAFY/Desktop/portfolio-projects/` — `01_group-buying` (공구한 영상), `02_blind-dating`, `03_familink` (패밀링크 영상 · gif)
- `C:/Users/SSAFY/Desktop/demo-pt/` — 발표 장표 · 영상
- 동글서울 트레일러 영상은 사용자 드라이브. 트레일러 컷신 코드는 `C:/Users/SSAFY/Desktop/wt-trailer` 로컬 브랜치 `feat/trailer-cutscene` 에만 있음 (원격 없음).

## 남은 할 일


- [x] 전화번호 · GitHub 주소 (11-25 넣음)
- [x] 프로필 사진 `assets/profile.jpg` (11-26, 정사각형으로 잘라 600px)
- [x] SSAFY 자율 프로젝트 우수상 (동글서울) 3장 맨 위에 넣음 — 대회명 날짜 2026.11 · 이름은 사용자 확인 필요
- [x] 수상 주최기관 · 설명 (11-26)
- [x] 노브랜드 인턴 업무 · Club-C 활동 (11-26)
- [x] 어학: OPIc IH 2026.03 · TOEIC 915 2024.12 (월까지만, 11-26)
- [x] 8장 오른쪽 = 발표 트레일러 영상 `assets/dongle-seoul-trailer.mp4` (원본 62MB 1080p → 720p 14MB 재인코딩, 클릭 재생 · preload none, 포스터 52초 장면). 예전 대표 이미지 `assets/dongle-seoul-cover.png` 는 파일만 남김
- [x] 9장 3D 월드 전/후 지도 `assets/dongle-seoul-roads-before.png` (10-22 스크린샷) · `roads-after.png` (11-26), 원래 비율 그대로 같은 높이 320px. 도로 스크립트는 kdyarchive 커밋이 대부분 (export-roads 8/9, roadSource 34/38)
- [x] 12장 "그 밖에 한 일" GIF 3개 (11-26). 3D 월드 칸은 `assets/dongle-seoul-world.gif` (한강 다리 095821 → 농장섬 100558 앞 6초 → 불꽃놀이 100445 4초, 15.8초 · 5.5MB). 9장 아래 자료 화면 `assets/dongle-seoul-loading.gif` (100726, 오른쪽 90px 자름), 캐릭터 칸은 `assets/dongle-seoul-character.gif`, 카메라 칸은 `assets/dongle-seoul-camera.gif` (실내 1인칭 · 3인칭) (11-26, 녹화 → ffmpeg 10fps 480px). GIF 만들기: imageio_ffmpeg 의 ffmpeg.exe. 퀘스트 · 미니게임 칸은 11-26 사용자 지시로 뺐다
- 동글서울은 프론트 관련 일만 쓴다 (11-26 사용자). 서버 판정 · Spring Boot 태그는 뺐다.
- [ ] Blind Dating 꼬리 질문 정리 (역할은 11-26 저장소로 확인함) (`reference/interview-qa.md` 에 동글서울 · 공구한 · 패밀링크는 있음)
- [ ] 배포: 개인 GitHub 저장소 + GitHub Pages 추천
