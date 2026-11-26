// ============================================================
//  동글서울 그림체: 3단 툰 셰이딩 · 파스텔 색 · 둥근 상자 · 둥글게 휘는 지평선
//  모든 재질·상자는 여기서 만들어요 (월드·랜드마크·미니게임 공통)
// ============================================================
import * as THREE from 'three';
import { roundedBox } from './roundedBox.js'; // RoundedBoxGeometry 와 같은 모양 · 빠르게
import { PERSON } from './seoulMap.js';

// 셰이더 공통 값
//  uCurve: 지평선이 둥글게 휘는 정도 (월드에서만 켜고 미니게임에선 0)
//  stOn/stP/stC: 캐릭터를 가리는 랜드마크·나무를 살짝 뚫어 보이게 · stR: 뚫는 크기 배율 (섬 PERSON, 건물 안 1)
export const U = {
  uCurve: { value: 0 },
  uRenderCenter: { value: new THREE.Vector2() }, uRenderRadius: { value: 0 },
  stP: { value: new THREE.Vector3() }, stC: { value: new THREE.Vector3() }, stOn: { value: 0 }, stR: { value: PERSON },
  night: { value: 0 },
  // 노을 색 보정 (원래 동글서울 '노을' 팔레트 쪽으로): 0 낮 ~ 1 노을·밤
  uDusk: { value: 0 }, uNight: { value: 0 },
  // 낮 색 보정 세기 (0 = 그대로, 1 = 따뜻하고 또렷하게). 노을·밤에는 영향 없음
  uDaySoft: { value: 1 },
  // 밤 가로등 빛 고임: 가로등 자리를 미리 그려 둔 빛 지도 (world.buildGlows) · 섬을 그릴 때만 켜짐
  uLampOn: { value: 0 }, uLampMap: { value: null }, uLampBox: { value: new THREE.Vector4(0, 0, 1, 1) },
};
export const WORLD_CURVE = 0.0016;

// 3단 그라데이션 (원래 동글서울과 같은 값)
let GRAD = null;
export function gradientMap() {
  if (GRAD) return GRAD;
  GRAD = new THREE.DataTexture(new Uint8Array([100, 180, 255]), 3, 1, THREE.RedFormat);
  GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}

// ---------- 색: 진한 원색을 동글서울 파스텔 쪽으로 ----------
const _hsl = {}, _c = new THREE.Color();
export function soft(c, out = new THREE.Color()) {
  _c.set(c);
  _c.getHSL(_hsl, THREE.SRGBColorSpace);
  let { h, s, l } = _hsl;
  if (l < 0.2) { // 아주 어두운 색(눈·머리카락·타이어): 어둡게 두되 따뜻한 갈색 기운
    s = Math.min(s, 0.4); l = 0.07 + l * 0.75;
    if (s < 0.12) { h = 0.07; s = 0.3; }
  } else {
    s = Math.min(1, s * 1.1 + (s > 0.08 ? 0.03 : 0));
    if (s > 0.2) l = Math.min(l, 0.88); // 흰색·회색은 그대로 밝게
  }
  return out.setHSL(h, s, l, THREE.SRGBColorSpace);
}
export const softHex = (c) => `#${soft(c).getHexString(THREE.SRGBColorSpace)}`;

// ---------- 셰이더 패치 (휘는 지평선 + 투과) ----------
function patch(sh) {
  Object.assign(sh.uniforms, U);
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uCurve;\nvarying vec3 vStW;')
    .replace('#include <project_vertex>', `#include <project_vertex>
      vec4 stw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        stw = instanceMatrix * stw;
      #endif
      vStW = (modelMatrix * stw).xyz;
      mvPosition.y -= mvPosition.z * mvPosition.z * uCurve;
      gl_Position = projectionMatrix * mvPosition;`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
      uniform vec3 stP; uniform vec3 stC; uniform float stOn; uniform float stR; uniform float uDusk; uniform float uNight; uniform float uDaySoft; uniform float uLampOn; uniform sampler2D uLampMap; uniform vec4 uLampBox; varying vec3 vStW; uniform vec2 uRenderCenter; uniform float uRenderRadius;
      vec3 si_hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x); }
      vec3 si_rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }`)
    .replace('#include <fog_fragment>', `
      #ifndef NO_GRADE
      float dayW = (1.0 - uDusk) * uDaySoft;
      if (dayW > 0.001) {
        vec3 hd = si_hsv(gl_FragColor.rgb);
        hd.y *= 1.0 - 0.08 * dayW;                      // 채도는 아주 조금만 빼고
        vec3 dc = si_rgb(hd) * mix(vec3(1.0), vec3(1.04, 1.0, 0.92), dayW); // 따뜻한 햇살 색
        dc = mix(dc, (dc - 0.5) * 1.06 + 0.5, dayW);    // 명암을 조금 또렷하게
        gl_FragColor.rgb = clamp(dc, 0.0, 1.0);
      }
      if (uDusk > 0.001) {
        vec3 hv = si_hsv(gl_FragColor.rgb);
        float gw = smoothstep(0.16, 0.24, hv.x) * (1.0 - smoothstep(0.42, 0.48, hv.x)); // 초록 → 올리브·황금빛
        float bw = smoothstep(0.45, 0.50, hv.x) * (1.0 - smoothstep(0.70, 0.76, hv.x)); // 파랑 → 연보라
        vec3 dv = hv;
        dv.x = mix(dv.x, mix(hv.x, 0.19, 0.6), gw); dv.y *= mix(1.0, 0.62, gw); dv.z = min(1.0, dv.z * mix(1.0, 1.12, gw));
        dv.x = mix(dv.x, 0.69, bw); dv.y *= mix(1.0, 0.55, bw);
        vec3 dc = si_rgb(dv) * vec3(1.0, 0.95, 0.9);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, dc, uDusk);
      }
      if (uLampOn > 0.001) {
        vec2 luv = (vStW.xz - uLampBox.xy) / uLampBox.zw;
        vec3 lamp = min(texture2D(uLampMap, luv).rgb, vec3(0.7)) * (1.0 - smoothstep(0.6, 3.2, vStW.y)); // 땅·벽 아래쪽만
        gl_FragColor.rgb += lamp * (0.35 + diffuseColor.rgb) * uLampOn * 1.6;
      }
      #endif
      #include <fog_fragment>`)
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      #ifndef NO_DISTANCE_CULL
      if (uRenderRadius > 0.0) { vec2 d = vStW.xz - uRenderCenter; if (dot(d, d) >= uRenderRadius * uRenderRadius) discard; }
      #endif
      #ifndef NO_SEETHROUGH
      if (stOn > 0.5 && vStW.y > 0.35) {
        vec3 dd = stP - stC; float L = length(dd); vec3 n = dd / L;
        vec3 w = vStW - stC; float t = dot(w, n);
        if (t > 0.0 && t < L - 1.1 * stR) {
          float rr = length(w - n * t);
          vec2 g = floor(gl_FragCoord.xy * 0.5);
          if (rr < 1.4 * stR || (rr < 2.3 * stR && mod(g.x + g.y, 2.0) < 1.0)) discard;
        }
      }
      #endif`);
}
export function stylize(m) {
  m.onBeforeCompile = patch;
  m.customProgramCacheKey = () => 'seoulisland-toon';
  m.clone = cloneWithPatch;
  return m;
}
// 월드 거리 숨김에서 원거리 랜드마크만 예외로 둔다.
// 공유 재질에 define을 붙이면 같은 재질을 쓰는 다른 건물도 예외가 되므로 복사본을 만든다.
export function distanceCullExemptMaterial(material) {
  const copy = material.clone();
  copy.defines = { ...copy.defines, NO_DISTANCE_CULL: '' };
  copy.needsUpdate = true;
  return copy;
}
// three 의 material.clone() 은 onBeforeCompile · customProgramCacheKey 를 안 옮김 → 복사본은 지평선이 안 휨
//  멀리서 보면 땅은 휘어 내려가고 복사본만 그 자리 높이에 남아 하늘에 뜬 신기루처럼 보임 (농부의마켓 분수 물막)
//  → 복사할 때 그 순간의 패치(이어 붙인 패치 포함)와 패치가 보는 defines(NO_GRADE 등 · 이것도 안 옮겨짐)를 같이 옮김
function cloneWithPatch() {
  const c = Object.getPrototypeOf(this).clone.call(this);
  if (this.defines) c.defines = { ...this.defines };
  c.onBeforeCompile = this.onBeforeCompile; c.customProgramCacheKey = this.customProgramCacheKey; c.clone = cloneWithPatch;
  return c;
}
// 패널 미리보기(차고 · 꾸미기 같은 작은 따로 그리는 장면): 툰 재질은 섬 · 건물 안과 셰이더 값(U)을 같이 쓴다.
//  그대로 그리면 건물 안 "가림 뚫기"(stOn: 카메라 ~ 주인공 사이, 높이 0.35 위를 버림)가 원점 근처 미리보기 몸을 잘라
//  아래 테두리만 남은 그릇 모양이 되고, 휘는 지평선 · 노을 · 가로등 빛도 섞인다 → 그리는 동안만 끄고 되돌린다
export const WORLD_ONLY = ['uCurve', 'uRenderRadius', 'stOn', 'uDusk', 'uNight', 'uLampOn'];
export function renderOffWorld(renderer, scene, camera) {
  const saved = WORLD_ONLY.map((k) => U[k].value);
  for (const k of WORLD_ONLY) U[k].value = 0;
  try { renderer.render(scene, camera); } finally { WORLD_ONLY.forEach((k, i) => { U[k].value = saved[i]; }); }
}
// 빛을 받지 않는 재질(유리창 불빛·전광판)도 지평선은 같이 휘어야 해서
export function basic(params) { return stylize(new THREE.MeshBasicMaterial(params)); }

// 캐릭터를 가려도 뚫어 보이지 않는 재질 (움직이는 열차처럼 지나가며 가리는 것) · 공유 재질은 그대로 두고 복사본에만 표시
const solidCache = new WeakMap();
export function solidMat(m) {
  if (m.defines?.NO_SEETHROUGH !== undefined) return m;
  let s = solidCache.get(m);
  if (!s) {
    s = m.clone();
    s.onBeforeCompile = m.onBeforeCompile;
    s.customProgramCacheKey = () => m.customProgramCacheKey() + '|solid';
    s.defines = { ...m.defines, NO_SEETHROUGH: '' };
    solidCache.set(m, s);
  }
  return s;
}

// Do not modify materials shared with the world; preserve each vehicle's paint shader.
export function solidObject(root) {
  root?.traverse?.((o) => {
    if (!o.isMesh) return;
    const solid = (m) => {
      if (m.defines?.NO_SEETHROUGH !== undefined || m.onBeforeCompile === THREE.Material.prototype.onBeforeCompile) return m;
      if (m.userData?.seoulislandOwnedMaterial || m.userData?.seoulislandOwnedPaint
        || m.userData?.seoulislandWheelClip || /^decal-surface-/.test(o.userData.meshTag ?? '')) {
        m.defines = { ...m.defines, NO_SEETHROUGH: '' };
        m.needsUpdate = true;
        return m;
      }
      return solidMat(m);
    };
    o.material = Array.isArray(o.material) ? o.material.map(solid) : solid(o.material);
  });
  return root;
}

// ---------- 재질 ----------
const cache = new Map();
// toonMat(색) 또는 toonMat({ color, map, emissive, ... }) — MeshLambertMaterial 자리에 그대로 씀
export function toonMat(arg = {}, extra) {
  if (typeof arg === 'string' || typeof arg === 'number' || arg?.isColor) {
    const key = (arg.isColor ? arg.getHexString() : String(arg)) + (extra ? JSON.stringify(extra) : '');
    if (!extra && cache.has(key)) return cache.get(key);
    const m = toonMat({ color: arg, ...extra });
    if (!extra) cache.set(key, m);
    return m;
  }
  const p = { ...arg };
  if (p.color !== undefined && !p.vertexColors) p.color = soft(p.color);
  if (p.emissive !== undefined) p.emissive = new THREE.Color(p.emissive).multiplyScalar(0.8);
  delete p.flatShading; delete p.reflectivity; delete p.shininess; delete p.specular; delete p.roughness; delete p.metalness; delete p.envMap;
  const m = new THREE.MeshToonMaterial({ gradientMap: gradientMap(), ...p });
  return stylize(m);
}

// ---------- 캐릭터 재질: 부드럽게 넘어가는 그늘 + 가장자리 빛 (동숲 느낌) ----------
//  월드는 3단 툰 그대로, 주민만 이 재질을 씀
let SOFT_GRAD = null;
function softGradientMap() {
  if (SOFT_GRAD) return SOFT_GRAD;
  SOFT_GRAD = new THREE.DataTexture(new Uint8Array([150, 196, 232, 255]), 4, 1, THREE.RedFormat);
  SOFT_GRAD.minFilter = SOFT_GRAD.magFilter = THREE.LinearFilter; SOFT_GRAD.generateMipmaps = false; SOFT_GRAD.needsUpdate = true;
  return SOFT_GRAD;
}
function patchChar(sh) {
  patch(sh);
  sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
    float rim = 1.0 - max(dot(normalize(vViewPosition), normal), 0.0);
    totalEmissiveRadiance += diffuseColor.rgb * smoothstep(0.55, 1.0, rim) * 0.22;`);
}
const charCache = new Map();
// charMat(색) 또는 charMat({ color, map, ... }) — toonMat 과 같은 모양으로 씀
export function charMat(arg = {}) {
  const plain = typeof arg === 'string' || typeof arg === 'number' || arg?.isColor;
  const key = plain ? (arg.isColor ? arg.getHexString() : String(arg)) : null;
  if (key && charCache.has(key)) return charCache.get(key);
  const m = toonMat(plain ? { color: arg } : arg);
  m.gradientMap = softGradientMap();
  m.onBeforeCompile = patchChar;
  m.customProgramCacheKey = () => 'seoulisland-char';
  if (key) charCache.set(key, m);
  return m;
}

// ---------- 둥근 상자 ----------
const gcache = new Map();
export function rbox(w, h, d) {
  const key = `${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)}`;
  let g = gcache.get(key);
  if (g) return g;
  const mn = Math.min(w, h, d), rad = Math.min(mn * 0.3, 0.16);
  if (mn < 0.035) g = new THREE.BoxGeometry(w, h, d);
  // 모서리가 작으면(몇 픽셀) 한 단으로 깎아도 똑같아 보임: 삼각형 300 → 108 · 창살 · 창턱 같은 작은 조각이 섬 상자의 대부분
  else g = roundedBox(w, h, d, rad < 0.08 ? 1 : 2, rad);
  g.userData.shared = true;
  gcache.set(key, g);
  return g;
}

// 바닥에 깔리는 동그란 그림자 (원래 동글서울 방식: 그림자 맵 대신 부드러운 원)
let blobGeo = null, blobMat = null;
export function blobShadow(parent, r = 0.5, y = 0.03) {
  blobGeo ||= (() => { const g = new THREE.CircleGeometry(1, 20); g.rotateX(-Math.PI / 2); return g; })();
  blobMat ||= stylize(new THREE.MeshBasicMaterial({ color: '#2c4a2a', transparent: true, opacity: 0.16, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  const m = new THREE.Mesh(blobGeo, blobMat);
  m.userData.blobShadow = true;
  m.position.y = y; m.scale.set(r, 1, r); m.renderOrder = 1;
  parent.add(m);
  return m;
}
