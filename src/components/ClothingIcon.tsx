import type { Shape } from '../types';

/** hex 색을 amount(-1~1)만큼 어둡게/밝게 */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

// 64×64 실루엣. body = 채움 외곽선, detail = 선 디테일
const TEE = 'M22 10 L13 13 L4 23 L11 31 L17 27 L17 57 L47 57 L47 27 L53 31 L60 23 L51 13 L42 10 Q32 19 22 10 Z';
const LONG =
  'M22 10 L14 13 Q8 16 6 30 L4 49 L12 50 L18 30 L18 57 L46 57 L46 30 L52 50 L60 49 L58 30 Q56 16 50 13 L42 10 Q32 19 22 10 Z';
const LONG_OPEN =
  'M22 9 L14 12 Q8 15 6 29 L4 49 L12 50 L18 30 L18 58 L46 58 L46 30 L52 50 L60 49 L58 29 Q56 15 50 12 L42 9 Z';
const COAT =
  'M22 6 L13 10 Q8 14 6 28 L4 50 L11 51 L16 30 L14 62 L50 62 L48 30 L53 51 L60 50 L58 28 Q56 14 51 10 L42 6 Z';
const PANTS = 'M17 6 H47 L51 60 H36 L32 22 L28 60 H13 Z';

const SHAPES: Record<Shape, { body: string[]; detail?: string[]; accent?: string[] }> = {
  tshirt: { body: [TEE] },
  sleeveless: { body: ['M24 7 L19 8 Q20 20 15 25 L15 57 L49 57 L49 25 Q44 20 45 8 L40 7 Q32 19 24 7 Z'] },
  longsleeve: { body: [LONG] },
  shirt: {
    body: [LONG_OPEN],
    detail: ['M32 18 V58', 'M22 9 L32 18 L42 9', 'M22 9 L26 20 L32 18 L38 20 L42 9'],
    accent: ['M32 26 h0.01', 'M32 34 h0.01', 'M32 42 h0.01', 'M32 50 h0.01'],
  },
  shirtShort: {
    body: ['M22 9 L13 12 L4 23 L11 31 L17 27 L17 57 L47 57 L47 27 L53 31 L60 23 L51 12 L42 9 Z'],
    detail: ['M32 18 V57', 'M22 9 L26 20 L32 18 L38 20 L42 9'],
    accent: ['M32 27 h0.01', 'M32 36 h0.01', 'M32 45 h0.01'],
  },
  polo: {
    body: [TEE],
    detail: ['M26 12 L29 20 L32 16 L35 20 L38 12', 'M32 16 V27'],
    accent: ['M32 21 h0.01', 'M32 25 h0.01'],
  },
  blouse: {
    body: ['M22 10 L13 13 L5 24 L12 31 L18 27 L15 57 L49 57 L46 27 L52 31 L59 24 L51 13 L42 10 Q32 21 22 10 Z'],
    detail: ['M28 15 L32 19 L36 15', 'M15 50 Q32 54 49 50'],
  },
  knit: { body: [LONG], detail: ['M18 52 H46', 'M18 54.5 H46', 'M5 45 L12 46', 'M52 46 L59 45', 'M24 12 Q32 21 40 12'] },
  sweatshirt: { body: [LONG], detail: ['M18 52 H46', 'M5 45 L12 46', 'M52 46 L59 45', 'M24 12 Q32 21 40 12'] },
  hoodie: {
    body: [LONG, 'M21 11 Q21 1 32 1 Q43 1 43 11 Q32 21 21 11 Z'],
    detail: ['M23 40 H41 L43 50 H21 Z', 'M29 17 V26', 'M35 17 V26'],
  },
  turtleneck: { body: [LONG, 'M25 3 H39 V13 Q32 17 25 13 Z'], detail: ['M25 6 H39', 'M25 9 H39', 'M18 52 H46'] },
  cardigan: {
    body: [LONG_OPEN],
    detail: ['M22 9 L32 36 L42 9', 'M32 36 V58', 'M18 53 H46'],
    accent: ['M32 41 h0.01', 'M32 47 h0.01', 'M32 53 h0.01'],
  },
  jacket: {
    body: [LONG_OPEN],
    detail: ['M22 9 L27 24 L32 38 L37 24 L42 9', 'M22 9 L24 22 L27 24', 'M42 9 L40 22 L37 24', 'M32 38 V58', 'M21 46 H28', 'M36 46 H43'],
  },
  trench: {
    body: [COAT],
    detail: ['M22 6 L32 30 L42 6', 'M32 30 V62', 'M15 38 H49', 'M22 6 L25 18 L29 20', 'M42 6 L39 18 L35 20'],
    accent: ['M27 26 h0.01', 'M37 26 h0.01', 'M27 46 h0.01', 'M37 46 h0.01'],
  },
  coat: {
    body: [COAT],
    detail: ['M22 6 L32 30 L42 6', 'M32 30 V62', 'M22 6 L25 18 L29 20', 'M42 6 L39 18 L35 20', 'M19 48 H26', 'M38 48 H45'],
    accent: ['M35 36 h0.01', 'M35 44 h0.01'],
  },
  padding: {
    body: ['M22 8 Q32 4 42 8 L51 12 Q58 15 59 30 L60 50 L52 51 L48 32 L48 55 Q32 59 16 55 L16 32 L12 51 L4 50 L5 30 Q6 15 13 12 Z'],
    detail: ['M16 22 Q32 26 48 22', 'M16 32 Q32 36 48 32', 'M16 43 Q32 47 48 43', 'M32 8 V57', 'M6 36 L13 36', 'M51 36 L58 36'],
  },
  paddingLong: {
    body: ['M22 6 Q32 2 42 6 L51 10 Q58 14 59 28 L60 50 L52 51 L48 30 L50 62 L14 62 L16 30 L12 51 L4 50 L5 28 Q6 14 13 10 Z'],
    detail: ['M16 19 Q32 23 48 19', 'M16 29 Q32 33 48 29', 'M15 40 Q32 44 49 40', 'M15 51 Q32 55 49 51', 'M32 6 V62'],
  },
  windbreaker: {
    body: [LONG_OPEN, 'M22 9 Q22 2 32 2 Q42 2 42 9 Z'],
    detail: ['M32 9 V58', 'M18 30 H46', 'M18 53 H46'],
  },
  pants: { body: [PANTS], detail: ['M17 11 H47', 'M32 11 V20', 'M21 11 Q23 17 18 18', 'M43 11 Q41 17 46 18'] },
  jeans: {
    body: [PANTS],
    detail: ['M17 11 H47', 'M32 11 V22', 'M21 11 Q23 18 18 19', 'M43 11 Q41 18 46 19', 'M24 12 V11'],
    accent: ['M37 14 h0.01'],
  },
  shorts: { body: ['M15 12 H49 L53 44 H35 L32 28 L29 44 H11 Z'], detail: ['M15 17 H49', 'M32 17 V26'] },
  skirt: { body: ['M20 8 H44 L55 58 H9 Z'], detail: ['M20 13 H44', 'M26 13 L20 58', 'M32 13 V58', 'M38 13 L44 58'] },
  dress: {
    body: ['M24 4 L20 5 Q21 15 18 19 L22 25 L9 61 H55 L42 25 L46 19 Q43 15 44 5 L40 4 Q32 14 24 4 Z'],
    detail: ['M21 25 Q32 28 43 25', 'M18 48 Q32 52 46 48'],
  },
  sneakers: {
    body: ['M6 44 Q6 32 14 30 L26 28 Q32 36 44 36 Q58 37 59 46 L59 48 H6 Z', 'M5 47 H60 V53 Q60 55 58 55 H7 Q5 55 5 53 Z'],
    detail: ['M27 31 L31 35', 'M31 30 L35 34', 'M35 31 L38 35', 'M10 51 H56'],
  },
  loafers: {
    body: ['M6 46 Q8 35 20 34 L38 34 Q57 36 59 46 V49 H6 Z', 'M5 48 H60 V53 Q60 55 58 55 H7 Q5 55 5 53 Z'],
    detail: ['M30 37 H46', 'M20 34 Q24 41 34 41'],
  },
  flats: {
    body: ['M6 46 Q8 38 18 38 Q28 42 40 40 Q57 40 59 47 V49 H6 Z', 'M5 48 H60 V53 Q60 55 58 55 H7 Q5 55 5 53 Z'],
    detail: ['M42 40 Q46 37 50 41'],
  },
  boots: {
    body: ['M15 6 H35 V35 Q50 36 57 43 V50 H15 Z', 'M14 49 H58 V55 Q58 57 56 57 H16 Q14 57 14 55 Z'],
    detail: ['M15 12 H35', 'M35 20 V35'],
  },
  sandals: {
    body: ['M5 47 Q5 41 13 41 H50 Q59 41 59 47 V52 H5 Z'],
    detail: ['M16 41 Q24 26 34 41', 'M30 41 Q40 28 50 41', 'M22 41 Q32 34 42 41'],
  },
  scarf: {
    body: ['M13 12 Q32 21 51 12 L51 25 Q32 33 13 25 Z', 'M37 26 L47 25 L50 58 L39 58 Z'],
    detail: ['M41 58 V62', 'M44 58 V62', 'M47 58 V62', 'M38 36 L48 35'],
  },
  beanie: {
    body: ['M12 42 Q12 13 32 13 Q52 13 52 42 Z', 'M10 40 H54 V51 H10 Z', 'M32 4 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0'],
    detail: ['M17 40 V51', 'M24 40 V51', 'M32 40 V51', 'M40 40 V51', 'M47 40 V51'],
  },
  cap: {
    body: ['M10 40 Q10 15 32 15 Q52 15 52 40 Z', 'M44 37 Q61 36 62 43 L44 44 Z'],
    detail: ['M32 15 V40', 'M20 19 Q24 30 22 40'],
  },
  bucket: {
    body: ['M19 37 L22 16 Q32 12 42 16 L45 37 Z', 'M8 38 Q32 30 56 38 L58 45 Q32 38 6 45 Z'],
    detail: ['M20 31 Q32 28 44 31'],
  },
  sunhat: {
    body: ['M4 40 Q32 26 60 40 Q50 48 32 48 Q14 48 4 40 Z', 'M20 36 Q20 18 32 18 Q44 18 44 36 Q32 39 20 36 Z'],
    detail: ['M20 32 Q32 35 44 32'],
  },
  gloves: {
    body: ['M16 58 V34 Q14 26 16 18 Q19 14 22 18 V30 V12 Q25 8 28 12 V28 V9 Q31 6 34 9 V28 V13 Q37 10 40 13 V36 L46 28 Q50 26 51 30 L44 46 Q42 52 40 58 Z'],
    detail: ['M16 50 H40'],
  },
  umbrella: {
    body: ['M5 33 Q8 6 32 5 Q56 6 59 33 Q52 28 45 33 Q38 28 32 33 Q26 28 19 33 Q12 28 5 33 Z'],
    detail: ['M32 5 Q24 18 19 33', 'M32 5 Q40 18 45 33', 'M32 33 V54 Q32 60 26 59 Q22 58 22 54'],
  },
  sunglasses: {
    body: ['M6 28 H28 V36 Q28 44 18 44 Q8 44 6 36 Z', 'M36 28 H58 V36 Q56 44 46 44 Q36 44 36 36 Z'],
    detail: ['M28 30 Q32 27 36 30', 'M6 28 L2 24', 'M58 28 L62 24'],
  },
};

interface Props {
  shape: Shape;
  color: string;
  className?: string;
  title?: string;
}

export function ClothingIcon({ shape, color, className, title }: Props) {
  const def = SHAPES[shape] ?? SHAPES.tshirt;
  const dark = luminance(color) < 0.28;
  const stroke = dark ? shade(color, 0.45) : shade(color, -0.42);
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <g fill={color} stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
        {def.body.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {def.detail && (
        <g fill="none" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
          {def.detail.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
      {def.accent && (
        <g fill="none" stroke={stroke} strokeWidth={2.6} strokeLinecap="round">
          {def.accent.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** 아이템 썸네일: 사용자 사진이 있으면 사진, 없으면 SVG */
export function ItemImage({ item, className }: { item: { shape: Shape; color: string; name: string; imageUrl: string | null }; className?: string }) {
  if (item.imageUrl) return <img src={item.imageUrl} alt={item.name} className={`${className} object-cover`} />;
  return <ClothingIcon shape={item.shape} color={item.color} title={item.name} className={className} />;
}
