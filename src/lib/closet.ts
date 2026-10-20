import type { Category, ClothingItem, ColorTone, Gender, Shape } from '../types';

export type Thickness = 'thin' | 'normal' | 'thick';

export interface ClosetEntry {
  id: string;
  name: string;
  category: Category;
  thickness: Thickness;
  colorKey: string;
  gender: Gender | 'unisex';
  photo: string | null; // 축소한 JPEG dataURL
  createdAt: number;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  top: '상의',
  bottom: '하의',
  dress: '원피스',
  outer: '아우터',
  shoes: '신발',
  acc: '액세서리',
};

export const THICKNESS_LABEL: Record<Thickness, string> = { thin: '얇음', normal: '보통', thick: '두꺼움' };

/** 카테고리 × 두께 → 적정 체감온도 */
const TEMP_RULE: Record<Category, Record<Thickness, [number, number]>> = {
  top: { thin: [20, 40], normal: [12, 22], thick: [-25, 14] },
  bottom: { thin: [20, 40], normal: [5, 25], thick: [-25, 10] },
  dress: { thin: [22, 40], normal: [12, 24], thick: [-10, 14] },
  outer: { thin: [15, 23], normal: [5, 16], thick: [-25, 6] },
  shoes: { thin: [18, 40], normal: [0, 30], thick: [-25, 10] },
  acc: { thin: [18, 40], normal: [-5, 20], thick: [-25, 8] },
};

const DEFAULT_SHAPE: Record<Category, Record<Thickness, Shape>> = {
  top: { thin: 'tshirt', normal: 'longsleeve', thick: 'knit' },
  bottom: { thin: 'shorts', normal: 'pants', thick: 'pants' },
  dress: { thin: 'dress', normal: 'dress', thick: 'dress' },
  outer: { thin: 'cardigan', normal: 'jacket', thick: 'padding' },
  shoes: { thin: 'sandals', normal: 'sneakers', thick: 'boots' },
  acc: { thin: 'cap', normal: 'scarf', thick: 'scarf' },
};

export const COLORS: { key: string; label: string; hex: string; tone: ColorTone }[] = [
  { key: 'black', label: '블랙', hex: '#222224', tone: 'neutral' },
  { key: 'white', label: '화이트', hex: '#f7f7f5', tone: 'neutral' },
  { key: 'gray', label: '그레이', hex: '#9aa0a6', tone: 'neutral' },
  { key: 'navy', label: '네이비', hex: '#26334f', tone: 'cool' },
  { key: 'beige', label: '베이지', hex: '#d7c3a3', tone: 'warm' },
  { key: 'brown', label: '브라운', hex: '#7a5232', tone: 'warm' },
  { key: 'khaki', label: '카키', hex: '#6b6a4c', tone: 'warm' },
  { key: 'denim', label: '데님', hex: '#6d8fbf', tone: 'cool' },
  { key: 'red', label: '레드', hex: '#c94040', tone: 'point' },
  { key: 'pink', label: '핑크', hex: '#f0a0a8', tone: 'point' },
  { key: 'yellow', label: '옐로', hex: '#e3b23c', tone: 'point' },
  { key: 'green', label: '그린', hex: '#3a6b4c', tone: 'point' },
];

export function toClothingItem(e: ClosetEntry): ClothingItem {
  const [minTemp, maxTemp] = TEMP_RULE[e.category][e.thickness];
  const color = COLORS.find((c) => c.key === e.colorKey) ?? COLORS[0];
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    gender: e.gender,
    ages: ['20s', '30s', '40s', '50s'],
    minTemp,
    maxTemp,
    styleTags: [],
    colorTone: color.tone,
    waterproof: false,
    windproof: false,
    shape: DEFAULT_SHAPE[e.category][e.thickness],
    color: color.hex,
    imageQuery: '',
    imageUrl: e.photo,
    credit: '내 옷장 사진',
    isUser: true,
  };
}

// ── IndexedDB ─────────────────────────────
const DB = 'oneul-closet';
const STORE = 'items';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const closetDb = {
  list: () => tx<ClosetEntry[]>('readonly', (s) => s.getAll() as IDBRequest<ClosetEntry[]>),
  put: (e: ClosetEntry) => tx('readwrite', (s) => s.put(e)),
  remove: (id: string) => tx('readwrite', (s) => s.delete(id)),
};

/** 사진을 긴 변 maxSize로 줄여 JPEG dataURL로 */
export function resizeImage(file: File, maxSize = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 읽을 수 없어요'));
    };
    img.src = url;
  });
}
