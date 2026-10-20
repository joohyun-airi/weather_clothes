import type { WeatherData } from '../types';

const FRESH_MS = 10 * 60 * 1000;
const KEEP_MS = 6 * 60 * 60 * 1000;

interface CacheEntry {
  savedAt: number;
  data: WeatherData;
}

function cacheKey(lat: number, lon: number) {
  return `wx:${lat.toFixed(2)},${lon.toFixed(2)}`;
}

function readCache(lat: number, lon: number): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lon));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > KEEP_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(lat: number, lon: number, data: WeatherData) {
  try {
    localStorage.setItem(cacheKey(lat, lon), JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* 저장 실패는 무시 */
  }
}

/** Open-Meteo 시간 문자열(Asia/Seoul, 오프셋 없음)을 ms로 */
function parseSeoulTime(s: string) {
  return new Date(`${s}:00+09:00`).getTime();
}

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    uv_index_max: (number | null)[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: (number | null)[];
  };
}

function normalize(j: OpenMeteoResponse): WeatherData {
  const hourly = j.hourly.time.map((t, i) => ({
    hour: Number(t.slice(11, 13)),
    temp: j.hourly.temperature_2m[i],
    pop: j.hourly.precipitation_probability[i] ?? 0,
  }));
  const afternoon = hourly.filter((h) => h.hour >= 12 && h.hour <= 20);
  return {
    temperature: j.current.temperature_2m,
    feelsLike: j.current.apparent_temperature,
    precipitation: j.current.precipitation,
    weatherCode: j.current.weather_code,
    windSpeed: j.current.wind_speed_10m,
    tempMax: j.daily.temperature_2m_max[0],
    tempMin: j.daily.temperature_2m_min[0],
    precipProbMax: j.daily.precipitation_probability_max[0] ?? 0,
    uvIndexMax: j.daily.uv_index_max[0] ?? 0,
    afternoonPrecipProb: afternoon.length ? Math.max(...afternoon.map((h) => h.pop)) : 0,
    hourly,
    observedAt: parseSeoulTime(j.current.time),
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const cached = readCache(lat, lon);
  if (cached && Date.now() - cached.savedAt < FRESH_MS) return cached.data;

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
    hourly: 'temperature_2m,precipitation_probability',
    timezone: 'Asia/Seoul',
    wind_speed_unit: 'ms',
    forecast_days: '1',
  });
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = normalize(await res.json());
    writeCache(lat, lon, data);
    return data;
  } catch (e) {
    if (cached) return cached.data;
    throw e;
  }
}

export interface WeatherLook {
  label: string;
  icon: string;
}

/** WMO weather code → 한국어 하늘상태 */
export function describeWeather(code: number): WeatherLook {
  if (code === 0) return { label: '맑음', icon: '☀️' };
  if (code === 1) return { label: '대체로 맑음', icon: '🌤️' };
  if (code === 2) return { label: '구름 조금', icon: '⛅' };
  if (code === 3) return { label: '흐림', icon: '☁️' };
  if (code === 45 || code === 48) return { label: '안개', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { label: '이슬비', icon: '🌦️' };
  if (code >= 61 && code <= 67) return { label: '비', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: '눈', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { label: '소나기', icon: '🌦️' };
  if (code === 85 || code === 86) return { label: '눈 소나기', icon: '🌨️' };
  if (code >= 95) return { label: '뇌우', icon: '⛈️' };
  return { label: '알 수 없음', icon: '🌡️' };
}

export function isRainCode(code: number) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
}

/** 수동 기온 슬라이더용 가짜 날씨 */
export function manualWeather(feels: number): WeatherData {
  return {
    temperature: feels,
    feelsLike: feels,
    precipitation: 0,
    weatherCode: 1,
    windSpeed: 2,
    tempMax: feels + 4,
    tempMin: feels - 4,
    precipProbMax: 0,
    uvIndexMax: feels >= 25 ? 7 : 3,
    afternoonPrecipProb: 0,
    hourly: [],
    observedAt: Date.now(),
  };
}
