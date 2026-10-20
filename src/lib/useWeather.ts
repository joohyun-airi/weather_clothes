import { useCallback, useEffect, useState } from 'react';
import type { WeatherData } from '../types';
import { CITIES, DEFAULT_CITY, nearestCity } from './cities';
import { load, save } from './storage';
import { fetchWeather } from './weather';

export type Source = { kind: 'gps'; lat: number; lon: number; city: string } | { kind: 'city'; city: string };

export interface WeatherState {
  status: 'loading' | 'ready' | 'error';
  data: WeatherData | null;
  cityName: string;
  locationDenied: boolean;
  source: Source | null;
  selectCity: (name: string | 'gps') => void;
  retry: () => void;
}

const CITY_KEY = 'omi:city';

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('no geolocation'));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 10 * 60 * 1000,
    });
  });
}

export function useWeather(): WeatherState {
  const [source, setSource] = useState<Source | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherState['status']>('loading');
  const [locationDenied, setDenied] = useState(false);
  const [nonce, setNonce] = useState(0);

  // 위치 결정: 사용자가 고른 도시가 있으면 그 도시, 아니면 GPS → 실패 시 서울
  const resolveGps = useCallback(async () => {
    try {
      const pos = await getPosition();
      const { latitude: lat, longitude: lon } = pos.coords;
      setDenied(false);
      setSource({ kind: 'gps', lat, lon, city: nearestCity(lat, lon).name });
    } catch {
      setDenied(true);
      setSource({ kind: 'city', city: DEFAULT_CITY.name });
    }
  }, []);

  useEffect(() => {
    const saved = load<string | null>(CITY_KEY, null);
    if (saved && CITIES.some((c) => c.name === saved)) setSource({ kind: 'city', city: saved });
    else void resolveGps();
  }, [resolveGps]);

  useEffect(() => {
    if (!source) return;
    let alive = true;
    const city = CITIES.find((c) => c.name === source.city) ?? DEFAULT_CITY;
    const [lat, lon] = source.kind === 'gps' ? [source.lat, source.lon] : [city.lat, city.lon];
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'));
    fetchWeather(lat, lon)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [source, nonce]);

  const selectCity = useCallback(
    (name: string | 'gps') => {
      if (name === 'gps') {
        save(CITY_KEY, null);
        setStatus('loading');
        void resolveGps();
      } else {
        save(CITY_KEY, name);
        setSource({ kind: 'city', city: name });
      }
    },
    [resolveGps],
  );

  return {
    status,
    data,
    cityName: source?.city ?? DEFAULT_CITY.name,
    locationDenied,
    source,
    selectCity,
    retry: () => setNonce((n) => n + 1),
  };
}
