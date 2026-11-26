// 둥근 상자 (three RoundedBoxGeometry 와 정점 · 법선 · uv 가 비트 단위로 같음 · 섬 짓기의 7% 를 쓰던 것)
//  RoundedBoxGeometry 는 크기마다 단위 상자를 새로 쪼개고 정점마다 법선 정규화 · angleTo 를 다시 계산함
//  그런데 법선 · 모서리 각도는 단(segments) 수로만 정해짐 → 단 수마다 한 번 계산해 두고, 크기 · 반지름에 따라 바뀌는 부분만 같은 순서로 계산
import * as THREE from 'three';

const HALF_ARC = Math.PI / 4;
// 면마다 uv 두 축: [uv 축, 투영 축, 바깥 방향 벡터, 1 - 를 하는지(u), 1 - 를 하는지(v), 길이 축(u), 길이 축(v)]
//  RoundedBoxGeometry 의 switch (side) 와 같은 순서 (오른쪽 · 왼쪽 · 위 · 아래 · 앞 · 뒤)
const FACES = [
  [[1, 0, 0], 'z', 'y', 'y', 'z', false, true, 'd', 'h'],
  [[-1, 0, 0], 'z', 'y', 'y', 'z', true, true, 'd', 'h'],
  [[0, 1, 0], 'x', 'z', 'z', 'x', true, false, 'w', 'd'],
  [[0, -1, 0], 'x', 'z', 'z', 'x', true, true, 'w', 'd'],
  [[0, 0, 1], 'x', 'y', 'y', 'x', true, true, 'w', 'h'],
  [[0, 0, -1], 'x', 'y', 'y', 'x', false, true, 'w', 'h'],
];

const templates = new Map();
// 단 수마다 (단위 상자의 인덱스 정점마다): 부호 · 법선(배정밀도) · uv 축마다 (각도 비율 · 앞쪽 호인지) · 면 · 인덱스 · 면 그룹
//  펼친 정점 값은 그 정점이 가리키는 인덱스 정점 값과 같음 (위치 · 면이 같으면 계산이 같음) → 인덱스 정점만 계산하고 펼친 것은 모음
function template(segments) {
  let t = templates.get(segments);
  if (t) return t;
  const total = segments * 2 + 1, half = 0.5 / total;
  const box = new THREE.BoxGeometry(1, 1, 1, total, total, total);
  const pos = box.attributes.position.array, m = pos.length / 3, index = box.index.array, faceTris = index.length / 2; // 펼친 정점 수 × 3 / 6
  const face = new Uint8Array(m);
  for (let i = 0; i < index.length; i++) face[index[i]] = Math.floor((i * 3) / faceTris);
  const sign = new Float64Array(m * 3), nor = new Float64Array(m * 3), ratio = new Float64Array(m * 2), front = new Uint8Array(m * 2);
  const v = new THREE.Vector3(), tn = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let k = 0, i = 0, j = 0; k < m; k++, i += 3, j += 2) {
    v.fromArray(pos, i);
    sign[i] = Math.sign(v.x); sign[i + 1] = Math.sign(v.y); sign[i + 2] = Math.sign(v.z);
    v.x -= Math.sign(v.x) * half; v.y -= Math.sign(v.y) * half; v.z -= Math.sign(v.z) * half;
    v.normalize();
    nor[i] = v.x; nor[i + 1] = v.y; nor[i + 2] = v.z;
    const f = FACES[face[k]];
    dir.fromArray(f[0]);
    for (let a = 0; a < 2; a++) {
      const uvAxis = f[1 + a * 2], proj = f[2 + a * 2];
      tn.copy(v); tn[proj] = 0; tn.normalize();
      ratio[j + a] = 1.0 - tn.angleTo(dir) / HALF_ARC;
      front[j + a] = Math.sign(tn[uvAxis]) === 1 ? 1 : 0;
    }
  }
  t = { m, index: index.slice(), face, sign, nor, ratio, front, groups: box.groups.map((g) => ({ ...g })) };
  box.dispose();
  templates.set(segments, t);
  return t;
}

// RoundedBoxGeometry.getUv 와 같은 계산 (각도 비율만 미리 구해 둠)
function arcUv(ratio, front, radius, side) {
  const tot = 2 * Math.PI * radius / 4, center = Math.max(side - 2 * radius, 0), arc = 0.5 * tot / (tot + center);
  if (front) return ratio * arc;
  return center / (tot + center) + arc + arc * (1.0 - ratio);
}

const gather = (src, k, index) => { const out = new Float32Array(index.length * k); for (let i = 0, o = 0; i < index.length; i++, o += k) for (let c = 0, s = index[i] * k; c < k; c++) out[o + c] = src[s + c]; return out; };
const meta = (g, p, t) => { g.type = 'RoundedBoxGeometry'; g.parameters = p; for (const gr of t.groups) g.addGroup(gr.start, gr.count, gr.materialIndex); return g; };

// 펼친 둥근 상자 (RoundedBoxGeometry 와 같음) · userData.indexedTwin 에 같은 정점을 공유하는 인덱스 도형 (city.js 인덱스 Merger 가 씀)
export function roundedBox(width = 1, height = 1, depth = 1, segments = 2, radius = 0.1) {
  const total = segments * 2 + 1;
  radius = Math.min(width / 2, height / 2, depth / 2, radius);
  if (total === 1) return new THREE.BoxGeometry(1, 1, 1, 1, 1, 1); // RoundedBoxGeometry 도 단 0 이면 단위 상자
  const t = template(segments), { m, face, sign, nor, ratio, front, index } = t;
  const P = new Float32Array(m * 3), N = new Float32Array(m * 3), UV = new Float32Array(m * 2);
  const bx = width / 2 - radius, by = height / 2 - radius, bz = depth / 2 - radius, len = { w: width, h: height, d: depth };
  for (let k = 0, i = 0, j = 0; k < m; k++, i += 3, j += 2) {
    const nx = nor[i], ny = nor[i + 1], nz = nor[i + 2];
    P[i] = bx * sign[i] + nx * radius; P[i + 1] = by * sign[i + 1] + ny * radius; P[i + 2] = bz * sign[i + 2] + nz * radius;
    N[i] = nx; N[i + 1] = ny; N[i + 2] = nz;
    const f = FACES[face[k]];
    const u = arcUv(ratio[j], front[j], radius, len[f[7]]), w = arcUv(ratio[j + 1], front[j + 1], radius, len[f[8]]);
    UV[j] = f[5] ? 1.0 - u : u; UV[j + 1] = f[6] ? 1.0 - w : w;
  }
  const params = { width, height, depth, segments, radius };
  const twin = meta(new THREE.BufferGeometry(), { ...params }, t);
  twin.setAttribute('position', new THREE.BufferAttribute(P, 3));
  twin.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  twin.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
  twin.setIndex(new THREE.BufferAttribute(index, 1));
  const g = meta(new THREE.BufferGeometry(), params, t);
  g.setAttribute('position', new THREE.BufferAttribute(gather(P, 3, index), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(gather(N, 3, index), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(gather(UV, 2, index), 2));
  g.userData.indexedTwin = twin;
  return g;
}
