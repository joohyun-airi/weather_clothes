import type { Age, Gender } from '../types';
import { AGE_LABEL } from '../lib/matcher';

interface Props {
  gender: Gender;
  age: Age;
  onGender: (g: Gender) => void;
  onAge: (a: Age) => void;
}

const AGES: Age[] = ['20s', '30s', '40s', '50s'];

export function FilterBar({ gender, age, onGender, onAge }: Props) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-[#f6f7fb]/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#f6f7fb]/75">
      <div className="flex flex-wrap items-center gap-1.5">
        <div role="radiogroup" aria-label="성별" className="flex rounded-full bg-slate-200/70 p-1">
          {(['male', 'female'] as Gender[]).map((g) => (
            <button
              key={g}
              role="radio"
              aria-checked={gender === g}
              onClick={() => onGender(g)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                gender === g ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {g === 'male' ? '남성' : '여성'}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="연령대" className="flex gap-1">
          {AGES.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={age === a}
              onClick={() => onAge(a)}
              className={`rounded-full border px-2.5 py-1.5 text-sm font-bold transition ${
                age === a ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {AGE_LABEL[a]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SensitiveToggle({ sensitive, onSensitive }: { sensitive: boolean; onSensitive: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500">
      추위를 많이 타요
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={sensitive} onChange={(e) => onSensitive(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-brand-500" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
