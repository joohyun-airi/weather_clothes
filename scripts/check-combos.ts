// 성별 2 × 연령대 4 × 온도 구간 8 (= 64) 조합을 날씨 변형별로 돌려 코디 3세트가 나오는지 점검한다.
// 실행: npm run check:combos  (-v 로 샘플 출력)
import { readFileSync } from 'node:fs';
import { bandOf, matchOutfits, outerRequired } from '../src/lib/matcher';
import type { Age, ClothingItem, Gender, MatchContext } from '../src/types';

const items: ClothingItem[] = JSON.parse(readFileSync(new URL('../public/data/clothes.json', import.meta.url), 'utf8'));
const verbose = process.argv.includes('-v');

const GENDERS: Gender[] = ['male', 'female'];
const AGES: Age[] = ['20s', '30s', '40s', '50s'];
// 각 구간의 경계값 + 극한값
const TEMPS: Record<number, number[]> = {
  8: [28, 33, 38], 7: [23, 27], 6: [20, 22], 5: [17, 19],
  4: [12, 16], 3: [9, 11], 2: [5, 8], 1: [4, -5, -18],
};
const VARIANTS: { name: string; v: Partial<MatchContext> }[] = [
  { name: '맑음', v: {} },
  { name: '비', v: { rainProb: 80, afternoonRain: true } },
  { name: '강풍', v: { windSpeed: 9 } },
  { name: '햇빛', v: { sunny: true } },
  { name: '일교차', v: { dailyRange: 12 } },
  { name: '셔플', v: { shuffle: 7 } },
];

let runs = 0;
const fails: string[] = [];

for (const gender of GENDERS)
  for (const age of AGES)
    for (const [band, temps] of Object.entries(TEMPS))
      for (const feels of temps)
        for (const { name, v } of VARIANTS) {
          const ctx: MatchContext = {
            feels, gender, age, rainProb: 0, afternoonRain: false, windSpeed: 2,
            sunny: false, dailyRange: 6, shuffle: 0, ...v,
          };
          runs++;
          const label = `${gender}/${age}/T${band}(${feels}°C)/${name}`;
          if (bandOf(feels) !== Number(band)) fails.push(`${label}: 구간 계산 오류`);
          const outfits = matchOutfits(items, ctx);
          if (outfits.length !== 3) fails.push(`${label}: 세트 ${outfits.length}개`);
          const keys = new Set(outfits.map((o) => o.items.map((i) => i.id).sort().join('|')));
          if (keys.size !== outfits.length) fails.push(`${label}: 중복 세트`);
          for (const o of outfits) {
            const has = (c: string) => o.items.some((i) => i.category === c);
            const body = has('dress') || (has('top') && has('bottom'));
            const probs: string[] = [];
            if (!body) probs.push('상의/하의 없음');
            if (!has('shoes')) probs.push('신발 없음');
            if (outerRequired(feels) && !has('outer')) probs.push('아우터 없음');
            if (o.items.filter((i) => i.colorTone === 'point').length > 1) probs.push('포인트 컬러 2개+');
            if (o.items.some((i) => i.gender !== 'unisex' && i.gender !== gender)) probs.push('성별 불일치');
            if (ctx.rainProb >= 60 && !o.items.some((i) => i.shape === 'umbrella')) probs.push('비인데 우산 없음');
            if (!o.reason) probs.push('설명 없음');
            if (probs.length) fails.push(`${label}: ${o.name} → ${probs.join(', ')}`);
          }
          if (verbose && age === '30s' && name !== '셔플') {
            console.log(`\n▶ ${label}`);
            for (const o of outfits) console.log(`  · ${o.name}: ${o.items.map((i) => i.name).join(' / ')}\n    ${o.reason}`);
          }
        }

console.log(`\n${runs}회 점검 (성별 2 × 연령 4 × 구간 8 = 64조합, 경계·극한 온도 × 날씨 ${VARIANTS.length}종)`);
if (fails.length) {
  console.log(`❌ 실패 ${fails.length}건`);
  for (const f of fails.slice(0, 60)) console.log('  ' + f);
  process.exit(1);
}
console.log('✅ 모든 조합에서 코디 3세트 생성');
