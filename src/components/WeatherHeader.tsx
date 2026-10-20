import type { WeatherData } from '../types';
import { CITIES } from '../lib/cities';
import { describeWeather } from '../lib/weather';

interface Props {
  data: WeatherData;
  cityName: string;
  isGps: boolean;
  manual: boolean;
  onCity: (name: string | 'gps') => void;
}

function ageLabel(ms: number) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}분 전 날씨`;
  return `${Math.round(min / 60)}시간 전 날씨`;
}

export function WeatherHeader({ data, cityName, isGps, manual, onCity }: Props) {
  const look = describeWeather(data.weatherCode);
  const age = Date.now() - data.observedAt;
  const stale = !manual && age > 30 * 60 * 1000;
  const rainSoon = data.afternoonPrecipProb >= 60;
  const summary = [
    `${cityName} ${Math.round(data.temperature)}°C`,
    `체감 ${Math.round(data.feelsLike)}°C`,
    rainSoon ? '오후 비' : look.label,
  ].join(', ');

  return (
    <header className="rounded-3xl bg-gradient-to-br from-brand-500 to-[#6f8cff] p-5 text-white shadow-lg shadow-brand-500/20">
      <div className="flex items-center justify-between gap-2">
        <label className="relative inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
          <span aria-hidden>{isGps ? '📍' : '🏙️'}</span>
          <select
            aria-label="도시 선택"
            className="cursor-pointer appearance-none bg-transparent pr-4 outline-none"
            value={isGps ? 'gps' : cityName}
            onChange={(e) => onCity(e.target.value)}
          >
            <option className="text-slate-900" value="gps">
              {isGps ? `현재 위치 (${cityName})` : '현재 위치 사용'}
            </option>
            {CITIES.map((c) => (
              <option key={c.name} className="text-slate-900" value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 text-xs">▾</span>
        </label>
        {stale && <span className="rounded-full bg-amber-300/90 px-2.5 py-1 text-xs font-bold text-amber-950">{ageLabel(age)}</span>}
        {manual && <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-bold">수동 입력</span>}
      </div>

      <p className="sr-only">{summary}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-start">
            <span className="text-6xl font-extrabold leading-none tracking-tight">{Math.round(data.temperature)}</span>
            <span className="mt-1 text-2xl font-bold">°C</span>
          </div>
          <p className="mt-2 text-base font-semibold">
            체감 {Math.round(data.feelsLike)}°C · {rainSoon ? '오후 비' : look.label}
          </p>
        </div>
        <div className="text-6xl leading-none" aria-hidden>
          {rainSoon && look.label !== '비' ? '🌦️' : look.icon}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="최저/최고" value={`${Math.round(data.tempMin)}° / ${Math.round(data.tempMax)}°`} />
        <Stat label="강수확률" value={`${Math.round(data.precipProbMax)}%`} />
        <Stat label="풍속" value={`${data.windSpeed.toFixed(1)}m/s`} />
      </dl>

      {data.hourly.length > 0 && <HourlyChart hourly={data.hourly} />}
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2">
      <dt className="opacity-80">{label}</dt>
      <dd className="mt-0.5 text-sm font-bold">{value}</dd>
    </div>
  );
}

/** F8: 오늘 시간대별 기온 미니 차트 */
function HourlyChart({ hourly }: { hourly: WeatherData['hourly'] }) {
  const pts = hourly.filter((h) => h.hour >= 6 && h.hour <= 23);
  if (pts.length < 2) return null;
  const temps = pts.map((p) => p.temp);
  const lo = Math.min(...temps) - 1;
  const hi = Math.max(...temps) + 1;
  const W = 300;
  const H = 54;
  const x = (i: number) => 10 + (i / (pts.length - 1)) * (W - 20);
  const y = (t: number) => 8 + (1 - (t - lo) / (hi - lo)) * (H - 22);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.temp).toFixed(1)}`).join(' ');
  const marks = [9, 15, 19].map((h) => pts.findIndex((p) => p.hour === h)).filter((i) => i >= 0);
  const nowHour = new Date().getHours();
  const nowIdx = pts.findIndex((p) => p.hour === nowHour);

  return (
    <div className="mt-4 rounded-2xl bg-white/10 px-2 pb-1 pt-2">
      <div className="flex justify-between px-2 text-[11px] font-semibold opacity-90">
        {marks.map((i) => (
          <span key={i}>
            {pts[i].hour === 9 ? '아침' : pts[i].hour === 15 ? '오후' : '저녁'} {Math.round(pts[i].temp)}°
            {pts[i].pop >= 40 && <span className="ml-0.5">💧{pts[i].pop}%</span>}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-14 w-full" aria-label="시간대별 기온 그래프">
        <path d={`${line} L${x(pts.length - 1)} ${H - 12} L${x(0)} ${H - 12} Z`} fill="rgba(255,255,255,.14)" />
        <path d={line} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {nowIdx >= 0 && <circle cx={x(nowIdx)} cy={y(pts[nowIdx].temp)} r={4} fill="white" />}
        {marks.map((i) => (
          <circle key={i} cx={x(i)} cy={y(pts[i].temp)} r={2.5} fill="white" opacity={0.85} />
        ))}
        {[6, 12, 18, 23].map((h) => {
          const i = pts.findIndex((p) => p.hour === h);
          return i < 0 ? null : (
            <text key={h} x={x(i)} y={H - 1} textAnchor="middle" fontSize="9" fill="white" opacity={0.75}>
              {h}시
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-gradient-to-br from-brand-500/60 to-[#6f8cff]/60 p-5" aria-label="날씨 불러오는 중">
      <div className="h-7 w-28 rounded-full bg-white/30" />
      <div className="mt-5 h-14 w-32 rounded-xl bg-white/30" />
      <div className="mt-3 h-4 w-40 rounded bg-white/30" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 rounded-2xl bg-white/25" />
        ))}
      </div>
    </div>
  );
}
