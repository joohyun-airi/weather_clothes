import type { ClothingItem, Outfit } from '../types';
import { CATEGORY_LABEL } from '../lib/closet';
import { shade } from './ClothingIcon';
import { ItemImage } from './ClothingIcon';

interface Props {
  outfit: Outfit;
  index: number;
  onItem: (item: ClothingItem) => void;
}

export function OutfitCard({ outfit, index, onItem }: Props) {
  const main = outfit.items.filter((i) => i.category !== 'acc');
  const acc = outfit.items.filter((i) => i.category === 'acc');
  return (
    <article className="flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-extrabold text-slate-900">
          <span className="mr-1.5 text-brand-500">{index + 1}</span>
          {outfit.name}
        </h3>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {main.map((it) => (
          <ItemTile key={it.id} item={it} onClick={() => onItem(it)} />
        ))}
      </div>
      {acc.length > 0 && (
        <div className="mt-2 flex gap-2">
          {acc.map((it) => (
            <ItemTile key={it.id} item={it} small onClick={() => onItem(it)} />
          ))}
        </div>
      )}

      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{outfit.reason}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {outfit.tags.map((t) => (
          <span key={t} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            #{t}
          </span>
        ))}
      </div>
    </article>
  );
}

function ItemTile({ item, small, onClick }: { item: ClothingItem; small?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-2xl p-2 text-left transition active:scale-[.98] ${small ? 'flex-1' : ''}`}
      style={{ background: shade(item.color, 0.86) }}
      aria-label={`${item.name} 상세 보기`}
    >
      <span className={`shrink-0 overflow-hidden rounded-xl bg-white/70 ${small ? 'h-10 w-10 p-1' : 'h-14 w-14 p-1.5'}`}>
        <ItemImage item={item} className="h-full w-full rounded-lg" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {CATEGORY_LABEL[item.category]}
          {item.isUser && <span className="ml-1 text-brand-600">· 내 옷</span>}
        </span>
        <span className="line-clamp-2 block text-[13px] font-semibold leading-tight text-slate-800">{item.name}</span>
      </span>
    </button>
  );
}

export function OutfitSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-4 ring-1 ring-slate-100">
      <div className="h-6 w-36 rounded bg-slate-200" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="mt-3 h-4 w-full rounded bg-slate-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
    </div>
  );
}
