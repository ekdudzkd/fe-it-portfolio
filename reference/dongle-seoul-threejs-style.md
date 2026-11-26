# 동글서울 Three.js 스타일 참고

동글서울(Three.js 0.186.1) 코드에서 뽑은 실제 값이다. 포트폴리오 3D 장면을 동글서울 느낌으로 만들고 싶을 때 참고한다.
**규칙이 아니라 참고 자료**다. 실제 디자인은 사용자가 그때그때 말하는 대로 한다.

- 경로는 원본 팀 저장소 `C:/Users/SSAFY/Desktop/S15P31B206/frontend/src/game/` 기준.
- 핵심 소스 사본: [dongle-seoul-source/](dongle-seoul-source/) (`toon.js` · `roundedBox.js` · UI 기획 `ui-DESIGN.md` · 차 스타일 명세 `vehicle-visual-style-spec.md`)

## 한눈에 — 동글 느낌을 내는 요점

1. **툰 재질**: `MeshToonMaterial` + 3단 명암 gradientMap `[100, 180, 255]` (NearestFilter). 광택 · PBR · 환경반사 없음.
2. **파스텔 보정 `soft()`**: 채도 ×1.1+0.03, 유채색 명도 상한 0.88. 형광 · 네온(채도 > 0.82) 금지.
3. **모든 조각은 둥근 상자 `rbox`**: 모서리 반경 = min(최단변 × 0.3, 0.16).
4. **톤매핑 없음** (NoToneMapping), 후처리 · 아웃라인 없음.
5. **하늘색 배경 + 옅은 안개**, 발밑에 동그란 가짜 그림자.
6. **지평선이 둥글게 휨** (셰이더에서 `y -= z² · 0.0016`).

## 1. 렌더러 (`engine.js:239-246`)

- `WebGLRenderer({ antialias: true })`, `setPixelRatio(Math.min(devicePixelRatio, 1.5))`
- `shadowMap.enabled = true`, `PCFShadowMap`
- 톤매핑 설정 없음 (기본 NoToneMapping), outputColorSpace 기본 SRGB. ACES · AgX 는 FPS · 배틀 미니게임에서만.
- 가짜 그림자 `blobShadow` (`toon.js:247`): 원판 + `MeshBasic #2c4a2a`, opacity 0.16, polygonOffset −4.

## 2. 조명 · 하늘

**월드** (`world.js:366-380`)
- `HemisphereLight('#ffffff', '#6aa84a', 1.8)` — 땅 쪽 초록빛
- `DirectionalLight('#fff1d6', 2.2)` 위치 (30, 50, 25), 그림자 2048 · bias −0.0006 · normalBias 0.04 · radius 3
- `AmbientLight('#ffffff', 0.1)`

**실내** (`interior.js:215-217`) — 책상 장면에 더 잘 맞을 수 있음
- Hemi `#ffffff` / `#c9a77a` 2.2, Dir `#fff1d6` 1.6 (3, 8, 6), Ambient 0.25

**미니 무대** (`stage.js:54-56`): Hemi `#ffffff` / `#8fcf8a` 1.9, Ambient 0.22, Dir 1.6 (5, 10, 6)

**배경 · 안개** (`world.js:219-220`): 배경 `#bfe6f7`, `Fog('#e2f4fb', 75, 165)`

**낮 · 노을 · 밤** (`daynight.js:14-26`, smoothstep 으로 섞음)

| | 안개 | 하늘광 / 땅광 | 햇빛 |
|---|---|---|---|
| 낮 | `#d2eaf8` | `#ffffff` / `#6aa84a` 1.45 | `#fff0d2` 2.65 |
| 노을 | `#ffcfa6` | `#ffd9c0` / `#5b4a78` 1.95 | `#ffb98a` 2.8 |
| 밤 | `#4a3f78` | `#8a80c8` / `#3a2c3c` 1.0 | `#c4b4f0` 0.6 |

**하늘 그라데이션** (`daynight.js:138-142`, 캔버스 세로 그라데이션 텍스처)
- 낮 `#3f8ee4` → `#6cb1ee` → `#c9e5f8`
- 노을 `#7A6BB5` → `#E59FA8` → `#FFC59C` → `#FFD7AB`
- 밤 `#1e1a44` → `#3a3170` → `#6a5aa0`
- 구름: 반지름 650 구면 조각에 구름 아틀라스 텍스처, MeshBasic · fog 끔 · opacity 0.94. 해는 radial-gradient Sprite `#fff1c2`.

## 3. 재질 (`toon.js` — 사본 있음)

- `toonMat(color)` (`:185`): `MeshToonMaterial` + `gradientMap()` 3단 `[100,180,255]` Nearest (`:28-33`)
- `soft()` (`:37`): 파스텔 보정. 아주 어두운 색은 따뜻한 갈색 기운.
- `stylize()` (`:53-118`) 셰이더 패치: 지평선 휨(`WORLD_CURVE = 0.0016`), 낮 색보정(채도 −8%, 색 곱 (1.04, 1, 0.92), 대비 ×1.06), 노을엔 초록 → 올리브 · 황금, 파랑 → 연보라.
- `charMat()` (`:218`, 캐릭터 전용): 4단 부드러운 그라데이션 `[150,196,232,255]` Linear + 림라이트(smoothstep(0.55, 1, rim) × 0.22).
- `rbox(w, h, d)` (`:232`, 구현 `roundedBox.js` — 사본 있음): three 의 RoundedBoxGeometry 와 같은 결과의 캐시 버전. 반경 < 0.08 이면 segments 1, 아니면 2.
- 사람 몸통은 Lathe, 머리는 superellipse(지수 3.2) 둥근 사각 구 (`character.js:286`, `:1345-1357`).
- 꽃잎은 납작한 8각 구, 잎은 ShapeGeometry (`flowerKit.js`, `city.js:310-334`).

## 4. 색

**땅** (`textures.js:43-55`)
- 잔디 `#68b947` / 밝은 `#80c95c` / 어두운 `#529e39`, 풀잎 점 `#b6e57e`, 숲 `#56a83c`
- 모래 `#f2cf86`, 흙길 `#e4b273`, 보도블록 `#ecdabb` (진한 `#d2bd98`), 회색 벽돌 `#d5d4d0`

**물 · 한강** (`textures.js:89-105`): 바탕 `#56bfe8` + 얼룩 `rgba(130,214,244,.45)` · `rgba(64,170,222,.35)` + 흰 물결

**차도** (`roadSurface.js:78`, `city.js:542`): 아스팔트 `#6b6f78` · `#6f737c`, 연석 `#e3ded3`, 흰 차선 `#f6f3ec`, 노란 차선 `#f2c14e`, 강변도로 `#8b8f99`

**나무** (`city.js:299-308`): 잎 `#3f9a4b` `#4aa856` `#56b660`, 윗면 `#78c86e`, 속 `#2f7a3c`, 줄기 `#b0835a`, 벚꽃 `#ffb2c6` `#ffc4d3`, 은행 `#f3bd28`

**꽃** (`flowerKit.js:15-21`): 튤립 `#d81b60`, 코스모스 `#e04fb5`, 장미 `#fff3d6` · `#f6c8d8`, 팬지 `#ffcf33` · `#7046b8`, 잔디 점꽃 `#ffffff` `#ffd166` `#ff8fa3`

**건물** (`city.js:540-550`): 돌 `#f1dcbc`, 벽돌 `#d9946a`, 나무 `#c99464`, 빨강 `#d8423a`, 콘크리트 `#d3d2cc`, 유리 `#8fb6d8` · `#a7c3d9`, 시청 지붕 `#6d69cf`

**포인트 색** (`character.js:62`): `#7bc8f6` `#ff8fa3` `#ffd166` `#7fcb98` `#c3a6ff` `#ff9f43` `#4a6fa5`

## 5. 캐릭터 (`character.js:10-62`)

- **2등신**: 키 22칸 중 다리 0–4.4, 종 모양 몸통 4.4–10.1 (폭 2.8 · 깊이 2.3), 머리 10–21.15. 머리가 어깨보다 훨씬 넓음 (반지름 [5.6, 5.8, 5.4]).
- 팔은 A자, 손은 장갑 모양, 목 없음. 월드 실제 키 1.7.
- 얼굴은 머리 앞 캔버스 그림. 콩알 눈 `#2b1d14` 타원 + 흰 하이라이트. 피부 `#ffdcbf` `#f6cba6` `#e8b48a` `#d9a273`.
- 동물 주민(토끼 · 고양이 · 곰 · 강아지 · 다람쥐 · 양 · 사슴)은 몸은 같고 머리만 입체 눈 · 코 · 귀.
- 눈 깜빡임: 2.5–5.5초마다 0.12초, 눈 scale.y → 0.15.

## 6. 카메라

- `PerspectiveCamera(46, aspect, 0.1, 1100)` (`engine.js:246`)
- 따라가기: pitch 0.55 rad (약 31.5°), 거리 11.2, 휠 줌 5.6–28, pitch 0.25–1.15 (`engine.js:3197-3228`)
- 실내: fov 40, pitch 0.6 (`interior.js:218`, `followCamera.js:8`)

## 7. UI (CSS) — `frontend/src/styles/style.css:341-364`

- 글꼴: `'Jua', 'Gothic A1', 'Gowun Dodum'` (제목 Jua · 본문 Gowun Dodum)
- 색: 배경 `#CFEAF6`, 패널 `#FFFAEA`, 글씨 `#6B4F2E`, 보조 `#8A6B45`, 포인트 `#F2A73B`, 초록 `#7FCB98` / `#5FAE7A`, 분홍 `#FF8FA3`, 칩 `#FFF3D6`
- 둥글기: 10 / 16 / 28px, 말풍선 26px
- 그림자: 갈색 `rgba(107,79,46,.14)` 두 겹 (예: `0 2px 4px, 0 6px 16px`), 테두리 `1.5px solid rgba(107,79,46,.28)`
- 노을 테마: 배경 `#F2B59A`, 글씨 `#3A3150`, 포인트 `#3A3150` / `#FFD27A`
- 콘셉트 (`ui-DESIGN.md`): "서울섬 이사 수첩" — 크림 종이, 분홍 제목, 둥근 선택지, 부드러운 그림자, 종이 도장 · 점선. 과한 반짝임 · 알림 압박 없음. 터치 영역 44px 이상.

## 책상 장면에 옮긴다면 (예시)

```js
// 3단 툰 명암
const grad = new THREE.DataTexture(new Uint8Array([100, 180, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap: grad });

// 둥근 상자
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const rbox = (w, h, d) => new RoundedBoxGeometry(w, h, d, 2, Math.min(Math.min(w, h, d) * 0.3, 0.16));

// 조명 (실내 조합)
scene.add(new THREE.HemisphereLight('#ffffff', '#c9a77a', 2.2));
const sun = new THREE.DirectionalLight('#fff1d6', 1.6); sun.position.set(3, 8, 6);
scene.add(sun, new THREE.AmbientLight('#ffffff', 0.25));
scene.background = new THREE.Color('#bfe6f7');
// renderer.toneMapping 은 건드리지 않는다 (NoToneMapping)
```
