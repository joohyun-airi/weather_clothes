import { useRef, useState } from 'react';
import type { Category, Gender } from '../types';
import {
  CATEGORY_LABEL,
  COLORS,
  THICKNESS_LABEL,
  resizeImage,
  toClothingItem,
  type ClosetEntry,
  type Thickness,
} from '../lib/closet';
import { ItemImage } from './ClothingIcon';
import { Sheet } from './Sheet';

interface Props {
  open: boolean;
  entries: ClosetEntry[];
  onClose: () => void;
  onAdd: (e: ClosetEntry) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const select = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500';

export function ClosetSheet({ open, entries, onClose, onAdd, onRemove }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('top');
  const [thickness, setThickness] = useState<Thickness>('normal');
  const [colorKey, setColorKey] = useState('black');
  const [gender, setGender] = useState<Gender | 'unisex'>('unisex');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = toClothingItem({ id: 'preview', name: name || '새 옷', category, thickness, colorKey, gender, photo, createdAt: 0 });

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError('');
    try {
      setPhoto(await resizeImage(f));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit() {
    setBusy(true);
    try {
      const color = COLORS.find((c) => c.key === colorKey)!;
      await onAdd({
        id: `user-${Date.now().toString(36)}`,
        name: name.trim() || `${color.label} ${CATEGORY_LABEL[category]}`,
        category,
        thickness,
        colorKey,
        gender,
        photo,
        createdAt: Date.now(),
      });
      setPhoto(null);
      setName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setError('저장하지 못했어요. 브라우저 저장공간을 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="내 옷장">
      <p className="text-sm text-slate-500">등록한 옷은 이 기기에만 저장되고, 추천할 때 우선으로 골라요.</p>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white"
            aria-label="사진 촬영 또는 선택"
          >
            {photo ? <img src={photo} alt="미리보기" className="h-full w-full object-cover" /> : (
              <span className="text-center text-xs font-semibold text-slate-400">📷<br />사진 추가</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (선택) 예: 회색 후드티"
              className={select}
              maxLength={30}
            />
            <p className="mt-2 text-xs text-slate-500">
              적정 체감 <b className="text-slate-700">{preview.minTemp}~{preview.maxTemp}°C</b>로 계산돼요
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select aria-label="카테고리" className={select} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
          <select aria-label="두께" className={select} value={thickness} onChange={(e) => setThickness(e.target.value as Thickness)}>
            {(Object.keys(THICKNESS_LABEL) as Thickness[]).map((t) => (
              <option key={t} value={t}>두께: {THICKNESS_LABEL[t]}</option>
            ))}
          </select>
          <select aria-label="색상" className={select} value={colorKey} onChange={(e) => setColorKey(e.target.value)}>
            {COLORS.map((c) => (
              <option key={c.key} value={c.key}>색상: {c.label}</option>
            ))}
          </select>
          <select aria-label="성별" className={select} value={gender} onChange={(e) => setGender(e.target.value as Gender | 'unisex')}>
            <option value="unisex">남녀공용</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-3 w-full rounded-2xl bg-brand-500 py-3 text-sm font-extrabold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? '저장 중…' : '옷장에 추가'}
        </button>
      </div>

      <h3 className="mt-5 text-sm font-extrabold text-slate-700">등록한 옷 {entries.length}벌</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">아직 등록한 옷이 없어요.</p>
      ) : (
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {entries.map((e) => {
            const it = toClothingItem(e);
            return (
              <li key={e.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2">
                <ItemImage item={it} className="h-12 w-12 shrink-0 rounded-xl bg-white" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{it.name}</p>
                  <p className="text-xs text-slate-400">{CATEGORY_LABEL[it.category]} · {it.minTemp}~{it.maxTemp}°C</p>
                </div>
                <button onClick={() => onRemove(e.id)} className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-200" aria-label={`${it.name} 삭제`}>
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
