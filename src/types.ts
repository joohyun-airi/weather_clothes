export type Category = 'top' | 'bottom' | 'dress' | 'outer' | 'shoes' | 'acc';
export type Gender = 'male' | 'female';
export type Age = '20s' | '30s' | '40s' | '50s';
export type ColorTone = 'neutral' | 'warm' | 'cool' | 'point';

export type Shape =
  | 'tshirt' | 'sleeveless' | 'longsleeve' | 'shirt' | 'shirtShort' | 'polo' | 'blouse'
  | 'knit' | 'sweatshirt' | 'hoodie' | 'turtleneck'
  | 'cardigan' | 'jacket' | 'trench' | 'coat' | 'padding' | 'paddingLong' | 'windbreaker'
  | 'pants' | 'jeans' | 'shorts' | 'skirt' | 'dress'
  | 'sneakers' | 'loafers' | 'boots' | 'sandals' | 'flats'
  | 'scarf' | 'beanie' | 'cap' | 'bucket' | 'sunhat' | 'gloves' | 'umbrella' | 'sunglasses';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  gender: Gender | 'unisex';
  ages: Age[];
  minTemp: number;
  maxTemp: number;
  styleTags: string[];
  colorTone: ColorTone;
  waterproof: boolean;
  windproof: boolean;
  shape: Shape;
  color: string;
  imageQuery: string;
  imageUrl: string | null;
  credit: string | null;
  /** 내 옷장(F9)에서 등록한 아이템 */
  isUser?: boolean;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number; // m/s
  tempMax: number;
  tempMin: number;
  precipProbMax: number;
  uvIndexMax: number;
  /** 오후(12~20시) 최대 강수확률 */
  afternoonPrecipProb: number;
  hourly: { hour: number; temp: number; pop: number }[];
  /** 관측 시각(ms) */
  observedAt: number;
}

export interface MatchContext {
  feels: number;
  gender: Gender;
  age: Age;
  rainProb: number;
  afternoonRain: boolean;
  windSpeed: number;
  sunny: boolean;
  dailyRange: number;
  shuffle: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  reason: string;
  tags: string[];
}
