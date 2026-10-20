import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { load, save } from '../lib/storage';
import { Sheet } from './Sheet';

/** 새 버전 감지 토스트 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
      <span className="flex-1 font-semibold">새 버전이 있어요</span>
      <button className="font-extrabold text-brand-100" onClick={() => updateServiceWorker(true)}>
        새로고침
      </button>
      <button className="text-slate-400" onClick={() => setNeedRefresh(false)} aria-label="닫기">
        ✕
      </button>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISIT_KEY = 'omi:visits';
const SHOWN_KEY = 'omi:installShown';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** 두 번째 방문부터 1회만: Android 설치 버튼 / iOS 안내 시트 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);
  const [eligible] = useState(() => {
    const visits = load<number>(VISIT_KEY, 0) + 1;
    save(VISIT_KEY, visits);
    return visits >= 2 && !load<boolean>(SHOWN_KEY, false) && !isStandalone();
  });
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    if (!eligible) return;
    if (isIos) {
      setVisible(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [eligible, isIos]);

  function dismiss() {
    save(SHOWN_KEY, true);
    setVisible(false);
    setIosOpen(false);
  }

  async function install() {
    if (isIos) {
      setIosOpen(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!visible) return null;
  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-100">
        <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
        <p className="flex-1 font-semibold text-slate-700">홈 화면에 추가하고 앱처럼 열어보세요</p>
        <button onClick={install} className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-extrabold text-white">
          홈 화면에 추가
        </button>
        <button onClick={dismiss} className="text-slate-400" aria-label="닫기">
          ✕
        </button>
      </div>
      <Sheet open={iosOpen} onClose={dismiss} title="홈 화면에 추가하기">
        <ol className="space-y-3 text-[15px] text-slate-700">
          <li>1. Safari 하단의 <b>공유 버튼 (□↑)</b>을 누르세요.</li>
          <li>2. 목록에서 <b>‘홈 화면에 추가’</b>를 고르세요.</li>
          <li>3. 오른쪽 위 <b>‘추가’</b>를 누르면 끝!</li>
        </ol>
      </Sheet>
    </>
  );
}
