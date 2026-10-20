# 오늘뭐입지

현재 위치 날씨(체감온도) + 성별·연령대로 코디 3세트를 추천하는 PWA. 백엔드 없는 정적 사이트(Vite + React + TS + Tailwind).

```bash
npm install
npm run dev            # 개발 서버 (서비스 워커 비활성)
npm run build && npm run preview   # PWA까지 확인
npm run check:combos   # 64개 조합 × 경계온도 × 날씨 변형 점검
node scripts/gen-clothes.mjs       # 인벤토리 수정 후 clothes.json 재생성
npm run icons          # favicon.svg → PWA 아이콘 PNG
```

## 구조

| 경로 | 내용 |
| --- | --- |
| `public/data/clothes.json` | 시드 인벤토리 119개 (`scripts/gen-clothes.mjs`가 생성) |
| `src/lib/matcher.ts` | 체감온도 8구간 필터 + 점수(연령·스타일태그·방수/방풍·내 옷 +5) + 3세트 조합 + 설명 템플릿 |
| `src/lib/weather.ts` | Open-Meteo 호출, 10분 캐시(localStorage), 실패 시 마지막 응답 |
| `src/lib/closet.ts` | 내 옷장(IndexedDB), 카테고리×두께 → 적정 온도 규칙 |
| `src/components/ClothingIcon.tsx` | 실루엣 SVG 36종, `color`로 칠함 |

## 배포 (Vercel)

GitHub에 올린 뒤 Vercel에서 Import → Framework `Vite` 자동 인식(Build `npm run build`, Output `dist`). HTTPS가 기본이라 위치 권한·서비스 워커가 바로 동작한다.
