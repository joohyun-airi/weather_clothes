import type { ClothingItem } from '../types';
import { CATEGORY_LABEL } from '../lib/closet';
import { ItemImage, shade } from './ClothingIcon';
import { Sheet } from './Sheet';

const GENDER_LABEL = { male: '남성', female: '여성', unisex: '남녀공용' };

export function ItemSheet({ item, onClose }: { item: ClothingItem | null; onClose: () => void }) {
  return (
    <Sheet open={!!item} onClose={onClose} title={item?.name ?? ''}>
      {item && (
        <div>
          <div className="flex justify-center rounded-3xl p-6" style={{ background: shade(item.color, 0.86) }}>
            <ItemImage item={item} className="h-40 w-40 rounded-2xl" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Row label="카테고리" value={CATEGORY_LABEL[item.category]} />
            <Row label="성별" value={GENDER_LABEL[item.gender]} />
            <Row label="적정 체감온도" value={`${item.minTemp <= -25 ? '-25 이하' : item.minTemp}°C ~ ${item.maxTemp >= 40 ? '40 이상' : item.maxTemp}°C`} />
            <Row label="기능" value={[item.waterproof && '방수', item.windproof && '방풍'].filter(Boolean).join(' · ') || '—'} />
          </dl>
          {item.styleTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.styleTags.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">
            사진 출처: {item.credit ?? '오늘뭐입지 자체 제작 SVG 일러스트'}
          </p>
        </div>
      )}
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-bold text-slate-800">{value}</dd>
    </div>
  );
}
