import type { Age, Category, ClothingItem, MatchContext, Outfit } from '../types';

export const AGE_TAGS: Record<Age, string[]> = {
  '20s': ['캐주얼', '스트릿', '오버핏', '트렌디'],
  '30s': ['미니멀', '세미포멀', '니트'],
  '40s': ['클래식', '세미포멀', '단정한 핏'],
  '50s': ['클래식', '편안함', '고급 소재', '단정한 핏'],
};

export const AGE_LABEL: Record<Age, string> = { '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대' };

/** 체감온도 → 구간 T1~T8 */
export function bandOf(feels: number): number {
  const t = Math.round(feels);
  if (t >= 28) return 8;
  if (t >= 23) return 7;
  if (t >= 20) return 6;
  if (t >= 17) return 5;
  if (t >= 12) return 4;
  if (t >= 9) return 3;
  if (t >= 5) return 2;
  return 1;
}

export const BAND_INFO: Record<number, { range: string; season: string }> = {
  8: { range: '28°C 이상', season: '한여름' },
  7: { range: '23~27°C', season: '초여름' },
  6: { range: '20~22°C', season: '늦봄' },
  5: { range: '17~19°C', season: '간절기' },
  4: { range: '12~16°C', season: '가을' },
  3: { range: '9~11°C', season: '늦가을' },
  2: { range: '5~8°C', season: '초겨울' },
  1: { range: '4°C 이하', season: '한겨울' },
};

const STYLE_LOOK: Record<string, string> = {
  캐주얼: '캐주얼룩',
  스트릿: '스트릿룩',
  오버핏: '오버핏 스트릿룩',
  트렌디: '트렌디룩',
  미니멀: '미니멀룩',
  세미포멀: '출근룩',
  니트: '니트 레이어드룩',
  클래식: '클래식룩',
  '단정한 핏': '단정한 오피스룩',
  편안함: '편안한 데일리룩',
  '고급 소재': '고급스러운 데일리룩',
};

const RAIN_ACC = new Set(['umbrella']);
const COLD_ACC = new Set(['scarf', 'beanie', 'gloves']);
const SUN_ACC = new Set(['sunglasses', 'cap', 'bucket', 'sunhat']);

// ── 한국어 조사 ─────────────────────────────
function batchim(word: string): number {
  const c = word.trim().charCodeAt(word.trim().length - 1);
  if (c < 0xac00 || c > 0xd7a3) return 0;
  return (c - 0xac00) % 28;
}
export function josa(word: string, pair: '을를' | '이가' | '으로로' | '은는'): string {
  const b = batchim(word);
  if (pair === '으로로') return word + (b && b !== 8 ? '으로' : '로');
  const [withB, withoutB] = pair === '을를' ? ['을', '를'] : pair === '이가' ? ['이', '가'] : ['은', '는'];
  return word + (b ? withB : withoutB);
}
/** "울 롱스커트 + 기모 스타킹" → 문장용 짧은 이름 */
const shortName = (it: ClothingItem) => it.name.split(' + ')[0];

// ── 점수 ────────────────────────────────────
interface Scored {
  item: ClothingItem;
  score: number;
}

/** 시드 기반 의사난수 (셔플용) */
function jitter(seed: number, id: string) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export function scoreItem(item: ClothingItem, ctx: MatchContext): number {
  let s = 0;
  if (item.ages.includes(ctx.age)) s += 3;
  const pref = AGE_TAGS[ctx.age];
  for (const tag of item.styleTags) if (pref.includes(tag)) s += 1;
  if (ctx.rainProb >= 60 && item.waterproof) s += 3;
  // 비 전용 아이템(레인 재킷·레인부츠)은 비가 안 오면 뒤로
  if (ctx.rainProb < 60 && item.styleTags.includes('레인웨어')) s -= 4;
  if (ctx.windSpeed >= 7 && item.windproof) s += 2;
  if (item.isUser) s += 5;
  // 적정 온도 범위 중앙에 가까울수록 약간 가산 (최대 +1)
  const mid = (item.minTemp + item.maxTemp) / 2;
  const half = Math.max(2, (item.maxTemp - item.minTemp) / 2);
  s += Math.max(0, 1 - Math.abs(ctx.feels - mid) / half);
  if (ctx.shuffle > 0) s += jitter(ctx.shuffle, item.id) * 4;
  return s;
}

function genderOk(item: ClothingItem, ctx: MatchContext) {
  return item.gender === 'unisex' || item.gender === ctx.gender;
}

/** 카테고리 후보. 0건이면 인접 온도로 넓혀 다시 찾는다. */
export function candidates(
  items: ClothingItem[],
  category: Category,
  ctx: MatchContext,
  extra: (it: ClothingItem) => boolean = () => true,
): Scored[] {
  const t = Math.round(ctx.feels);
  const pool = items.filter((it) => it.category === category && genderOk(it, ctx) && extra(it));
  for (let widen = 0; widen <= 15; widen += 3) {
    const hit = pool.filter((it) => it.minTemp - widen <= t && t <= it.maxTemp + widen);
    if (hit.length) {
      return hit
        .map((item) => ({ item, score: scoreItem(item, ctx) - widen * 0.5 }))
        .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    }
  }
  return [];
}

// ── 조합 ────────────────────────────────────
export function outerRequired(feels: number) {
  return bandOf(feels) <= 6;
}

const TOP_N = 3;

function pick(list: Scored[], used: Map<string, number>, pointCount: number, n = TOP_N): ClothingItem | null {
  if (!list.length) return null;
  const head = list.slice(0, Math.max(n, 1));
  const ok = (it: ClothingItem) => pointCount < 1 || it.colorTone !== 'point';
  const allowed = head.filter((s) => ok(s.item));
  const pool = allowed.length ? allowed : list.filter((s) => ok(s.item)).slice(0, n);
  const src = pool.length ? pool : head;
  let best = src[0];
  for (const s of src) if ((used.get(s.item.id) ?? 0) < (used.get(best.item.id) ?? 0)) best = s;
  return best.item;
}

export function matchOutfits(all: ClothingItem[], ctx: MatchContext, count = 3): Outfit[] {
  const band = bandOf(ctx.feels);
  const rainy = ctx.rainProb >= 60;
  const cold = band <= 2;
  const sunny = ctx.sunny && band >= 6;

  const tops = candidates(all, 'top', ctx);
  const bottoms = candidates(all, 'bottom', ctx);
  const dresses = ctx.gender === 'female' ? candidates(all, 'dress', ctx) : [];
  const shoes = candidates(all, 'shoes', ctx);
  const needOuter = outerRequired(ctx.feels);
  // 더운 날에도 비 예보·큰 일교차엔 걸칠 아우터를 선택적으로 넣는다
  const optionalOuter = !needOuter && (ctx.dailyRange >= 10 || rainy) && band <= 7;
  const outers =
    needOuter || optionalOuter
      ? candidates(all, 'outer', ctx, (it) => needOuter || !rainy || it.waterproof || ctx.dailyRange >= 10)
      : [];
  const rainAcc = rainy ? candidates(all, 'acc', ctx, (it) => RAIN_ACC.has(it.shape)) : [];
  const coldAcc = cold ? candidates(all, 'acc', ctx, (it) => COLD_ACC.has(it.shape)) : [];
  const sunAcc = sunny && !rainy ? candidates(all, 'acc', ctx, (it) => SUN_ACC.has(it.shape)) : [];

  // 원피스를 쓸 세트: 원피스 점수가 상의 1순위와 비슷하면 두 번째 세트에 넣는다
  const dressSlot = dresses.length && tops.length && dresses[0].score >= tops[0].score - 3 ? 1 : -1;

  const used = new Map<string, number>();
  const seen = new Set<string>();
  const outfits: Outfit[] = [];

  for (let k = 0; k < count + 4 && outfits.length < count; k++) {
    const items: ClothingItem[] = [];
    let points = 0;
    const add = (it: ClothingItem | null) => {
      if (!it) return;
      items.push(it);
      if (it.colorTone === 'point') points++;
    };
    // 반복이 길어지면 후보 폭을 넓혀 중복 세트를 피한다
    const n = TOP_N + Math.max(0, k - count + 1) * 2;

    if (needOuter || optionalOuter) add(pick(outers, used, points, n));
    if ((k % count) === dressSlot) {
      add(pick(dresses, used, points, n));
    } else {
      add(pick(tops, used, points, n));
      add(pick(bottoms, used, points, n));
    }
    add(pick(shoes, used, points, n));
    if (rainy) add(pick(rainAcc, used, points, n));
    if (cold) add(pick(coldAcc, used, points, n));
    if (sunny && !rainy) add(pick(sunAcc, used, points, n));

    for (const it of items) used.set(it.id, (used.get(it.id) ?? 0) + 1);
    const key = items.map((i) => i.id).sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    outfits.push(buildOutfit(items, ctx, band, outfits.length));
  }
  return outfits;
}

const ORDER: Category[] = ['outer', 'top', 'dress', 'bottom', 'shoes', 'acc'];

function buildOutfit(items: ClothingItem[], ctx: MatchContext, band: number, idx: number): Outfit {
  items.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const pref = AGE_TAGS[ctx.age];
  const tagCount = new Map<string, number>();
  for (const it of items) for (const t of it.styleTags) tagCount.set(t, (tagCount.get(t) ?? 0) + (pref.includes(t) ? 1.5 : 1));
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const lead = tags[0];
  const name = `${BAND_INFO[band].season} ${STYLE_LOOK[lead] ?? '데일리룩'}`;
  return {
    id: `${idx}-${items.map((i) => i.id).join('+')}`,
    name,
    items,
    reason: explain(items, ctx, band),
    tags: tags.slice(0, 3),
  };
}

function explain(items: ClothingItem[], ctx: MatchContext, band: number): string {
  const t = Math.round(ctx.feels);
  const outer = items.find((i) => i.category === 'outer');
  const main = items.find((i) => i.category === 'dress') ?? items.find((i) => i.category === 'top');
  const shoes = items.find((i) => i.category === 'shoes');
  const umbrella = items.find((i) => i.shape === 'umbrella');
  const warmAcc = items.find((i) => COLD_ACC.has(i.shape));

  let first: string;
  if (outer && !outerRequired(ctx.feels)) {
    first = `체감 ${t}°C지만 일교차가 커서 ${josa(shortName(outer), '을를')} 챙겼어요.`;
  } else if (outer) {
    const o = shortName(outer);
    first =
      band === 1
        ? `체감 ${t}°C 강추위라 ${josa(o, '으로로')} 보온을 챙겼어요.`
        : band === 2
          ? `체감 ${t}°C로 쌀쌀해서 ${josa(o, '을를')} 입었어요.`
          : band <= 4
            ? `체감 ${t}°C라 ${josa(o, '을를')} 걸쳤어요.`
            : `체감 ${t}°C로 선선해서 ${josa(o, '을를')} 가볍게 걸쳤어요.`;
  } else if (main) {
    const m = shortName(main);
    first =
      band === 8
        ? `체감 ${t}°C 무더위라 ${josa(m, '으로로')} 시원하게 입었어요.`
        : `체감 ${t}°C로 따뜻해서 ${josa(m, '이가')} 딱 좋아요.`;
  } else {
    first = `체감 ${t}°C에 맞춰 골랐어요.`;
  }

  const when = ctx.afternoonRain ? '오후에 비 소식이 있어' : '비 소식이 있어';
  let second = '';
  if (ctx.rainProb >= 60 && shoes?.waterproof) second = `${when} 방수되는 ${josa(shortName(shoes), '으로로')} 골랐어요.`;
  else if (ctx.rainProb >= 60 && umbrella) second = `${when} ${josa(shortName(umbrella), '을를')} 챙겼어요.`;
  else if (ctx.windSpeed >= 7 && outer?.windproof) second = '바람이 강해 바람을 막아주는 아우터로 골랐어요.';
  else if (warmAcc) {
    const part = warmAcc.shape === 'beanie' ? '머리' : warmAcc.shape === 'gloves' ? '손끝' : '목';
    second = `${josa(shortName(warmAcc), '으로로')} ${part}까지 따뜻하게 마무리했어요.`;
  }
  else {
    const hit = items.flatMap((i) => i.styleTags).find((tg) => AGE_TAGS[ctx.age].includes(tg));
    if (hit) second = `${AGE_LABEL[ctx.age]}가 즐겨 입는 ${hit} 무드로 맞췄어요.`;
  }
  return second ? `${first} ${second}` : first;
}
