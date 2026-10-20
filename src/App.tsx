import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Age, ClothingItem, Gender, MatchContext } from './types';
import { BAND_INFO, bandOf, matchOutfits } from './lib/matcher';
import { closetDb, toClothingItem, type ClosetEntry } from './lib/closet';
import { useStored } from './lib/storage';
import { useWeather } from './lib/useWeather';
import { isRainCode, manualWeather } from './lib/weather';
import { FilterBar, SensitiveToggle } from './components/FilterBar';
import { ItemSheet } from './components/ItemSheet';
import { ClosetSheet } from './components/ClosetSheet';
import { OutfitCard, OutfitSkeleton } from './components/OutfitCard';
import { WeatherHeader, WeatherSkeleton } from './components/WeatherHeader';
import { InstallPrompt, UpdateToast } from './components/PwaPrompts';

export default function App() {
  const weather = useWeather();
  const [gender, setGender] = useStored<Gender>('omi:gender', 'male');
  const [age, setAge] = useStored<Age>('omi:age', '30s');
  const [sensitive, setSensitive] = useStored<boolean>('omi:sensitive', false);
  const [shuffle, setShuffle] = useState(0);
  const [manualTemp, setManualTemp] = useState<number | null>(null);
  const [inventory, setInventory] = useState<ClothingItem[] | null>(null);
  const [closet, setCloset] = useState<ClosetEntry[]>([]);
  const [detail, setDetail] = useState<ClothingItem | null>(null);
  const [closetOpen, setClosetOpen] = useState(false);

  useEffect(() => {
    fetch('/data/clothes.json')
      .then((r) => r.json())
      .then(setInventory)
      .catch(() => setInventory([]));
    closetDb.list().then(setCloset).catch(() => setCloset([]));
  }, []);

  const data = manualTemp != null ? manualWeather(manualTemp) : weather.data;

  const ctx: MatchContext | null = useMemo(() => {
    if (!data) return null;
    const rainProb = Math.max(data.precipProbMax, isRainCode(data.weatherCode) ? 80 : 0);
    return {
      feels: data.feelsLike - (sensitive ? 3 : 0),
      gender,
      age,
      rainProb,
      afternoonRain: data.afternoonPrecipProb >= 60,
      windSpeed: data.windSpeed,
      sunny: data.uvIndexMax >= 6 || (data.weatherCode <= 1 && data.feelsLike >= 25),
      dailyRange: data.tempMax - data.tempMin,
      shuffle,
    };
  }, [data, gender, age, sensitive, shuffle]);

  const outfits = useMemo(() => {
    if (!ctx || !inventory) return null;
    return matchOutfits([...inventory, ...closet.map(toClothingItem)], ctx);
  }, [ctx, inventory, closet]);

  const addCloset = useCallback(async (e: ClosetEntry) => {
    await closetDb.put(e);
    setCloset(await closetDb.list());
  }, []);
  const removeCloset = useCallback(async (id: string) => {
    await closetDb.remove(id);
    setCloset(await closetDb.list());
  }, []);

  const notices: string[] = [];
  if (data && ctx) {
    if (ctx.rainProb >= 60)
      notices.push(`☔ ${ctx.afternoonRain ? '오후에 ' : ''}비 예보 (강수확률 ${Math.round(ctx.rainProb)}%) — 우산과 방수 신발을 챙기세요`);
    if (ctx.dailyRange >= 10) notices.push(`🧥 일교차 ${Math.round(ctx.dailyRange)}°C — 걸치기 아우터 챙기세요`);
    if (ctx.windSpeed >= 7) notices.push(`💨 바람이 강해요 (${ctx.windSpeed.toFixed(1)}m/s) — 방풍 아우터 추천`);
  }

  const showError = weather.status === 'error' && manualTemp == null;
  const loading = !showError && (!data || !outfits);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-slate-900">
          오늘<span className="text-brand-500">뭐입지</span>
        </h1>
        <button
          onClick={() => setClosetOpen(true)}
          className="rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          👕 내 옷장{closet.length > 0 && <span className="ml-1 text-brand-600">{closet.length}</span>}
        </button>
      </div>

      <div>
        {weather.locationDenied && (
          <div className="mb-3 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            📍 위치 권한이 없어 <b>{weather.cityName}</b> 기준으로 보여드려요. 위 도시 메뉴에서 바꿀 수 있어요.
          </div>
        )}

        {showError ? (
          <ErrorPanel onRetry={weather.retry} onManual={setManualTemp} />
        ) : data ? (
          <WeatherHeader
            data={data}
            cityName={weather.cityName}
            isGps={weather.source?.kind === 'gps'}
            manual={manualTemp != null}
            onCity={(c) => {
              setManualTemp(null);
              weather.selectCity(c);
            }}
          />
        ) : (
          <WeatherSkeleton />
        )}

        {manualTemp != null && (
          <ManualSlider value={manualTemp} onChange={setManualTemp} onExit={() => setManualTemp(null)} />
        )}
      </div>

      <FilterBar
        gender={gender}
        age={age}
        onGender={(g) => { setGender(g); setShuffle(0); }}
        onAge={(a) => { setAge(a); setShuffle(0); }}
      />

      {notices.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {notices.map((n) => (
            <li key={n} className="rounded-2xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 ring-1 ring-sky-100">
              {n}
            </li>
          ))}
        </ul>
      )}

      {ctx && !showError && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-slate-500">
            체감 {Math.round(ctx.feels)}°C · T{bandOf(ctx.feels)} ({BAND_INFO[bandOf(ctx.feels)].range}) 기준
            {sensitive && <span className="ml-1 text-brand-600">· 추위 보정 -3°C</span>}
            {manualTemp == null && data && (
              <button className="ml-2 text-xs font-semibold text-slate-400 underline" onClick={() => setManualTemp(Math.round(data.feelsLike))}>
                온도 조절
              </button>
            )}
          </p>
          <SensitiveToggle sensitive={sensitive} onSensitive={setSensitive} />
        </div>
      )}

      {!showError && (
        <section aria-label="추천 코디" aria-live="polite" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {loading || !outfits
            ? [0, 1, 2].map((i) => <OutfitSkeleton key={i} />)
            : outfits.map((o, i) => <OutfitCard key={o.id} outfit={o} index={i} onItem={setDetail} />)}
        </section>
      )}

      {outfits && outfits.length > 0 && (
        <button
          onClick={() => setShuffle((s) => s + 1)}
          className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition active:scale-95"
        >
          🔀 다른 코디 보기
        </button>
      )}

      <div className="mt-6">
        <InstallPrompt />
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        날씨 데이터: <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · 일러스트: 자체 제작
      </footer>

      <ItemSheet item={detail} onClose={() => setDetail(null)} />
      <ClosetSheet open={closetOpen} entries={closet} onClose={() => setClosetOpen(false)} onAdd={addCloset} onRemove={removeCloset} />
      <UpdateToast />
    </div>
  );
}

function ErrorPanel({ onRetry, onManual }: { onRetry: () => void; onManual: (t: number) => void }) {
  return (
    <div className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
      <p className="text-4xl">🌫️</p>
      <p className="mt-2 font-extrabold text-slate-800">날씨를 불러오지 못했어요</p>
      <p className="mt-1 text-sm text-slate-500">네트워크를 확인하고 다시 시도하거나, 체감온도를 직접 정해보세요.</p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={onRetry} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white">
          다시 시도
        </button>
        <button onClick={() => onManual(15)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          기온 직접 입력
        </button>
      </div>
    </div>
  );
}

function ManualSlider({ value, onChange, onExit }: { value: number; onChange: (t: number) => void; onExit: () => void }) {
  return (
    <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between text-sm font-bold text-slate-700">
        <label htmlFor="manual-temp">체감온도 직접 조절</label>
        <span className="text-brand-600">{value}°C</span>
      </div>
      <input
        id="manual-temp"
        type="range"
        min={-15}
        max={38}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-500"
      />
      <button onClick={onExit} className="mt-1 text-xs font-semibold text-slate-400 underline">
        실제 날씨로 돌아가기
      </button>
    </div>
  );
}
