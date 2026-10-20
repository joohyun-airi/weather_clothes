export interface City {
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: '서울', lat: 37.5665, lon: 126.978 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '수원', lat: 37.2636, lon: 127.0286 },
  { name: '성남', lat: 37.42, lon: 127.1265 },
  { name: '고양', lat: 37.6584, lon: 126.832 },
  { name: '춘천', lat: 37.8813, lon: 127.7298 },
  { name: '강릉', lat: 37.7519, lon: 128.8761 },
  { name: '청주', lat: 36.6424, lon: 127.489 },
  { name: '세종', lat: 36.48, lon: 127.289 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '전주', lat: 35.8242, lon: 127.148 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '포항', lat: 36.019, lon: 129.3435 },
  { name: '울산', lat: 35.5384, lon: 129.3114 },
  { name: '창원', lat: 35.2279, lon: 128.6811 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '여수', lat: 34.7604, lon: 127.6622 },
  { name: '제주', lat: 33.4996, lon: 126.5312 },
];

export const DEFAULT_CITY = CITIES[0];

function distKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = Math.PI / 180;
  const dLat = (bLat - aLat) * r;
  const dLon = (bLon - aLon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** 위경도에서 가장 가까운 주요 도시 (역지오코딩 대신) */
export function nearestCity(lat: number, lon: number): City {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = distKm(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best;
}
