import { CircleAlert, KeyRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { missingFirebaseKeys } from '../../firebase/config.js';

// Shown wherever a Firebase-backed feature is opened before the keys exist in .env.
export default function FirebaseNotice({ className = '' }) {
  const { t } = useLanguage();

  return (
    <div role="note" className={`rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-start ${className}`}>
      <p className="flex items-center gap-2 font-bold text-amber-200">
        <KeyRound className="size-4 shrink-0" />
        {t('firebase.title')}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/90">{t('firebase.text')}</p>
      {missingFirebaseKeys.length > 0 && (
        <>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted">
            <CircleAlert className="size-3.5 shrink-0" />
            {t('firebase.missing')}
          </p>
          <ul dir="ltr" className="mt-1.5 flex flex-wrap gap-1.5 rtl:justify-end">
            {missingFirebaseKeys.map((key) => (
              <li key={key} className="rounded-md border border-edge bg-space/60 px-2 py-0.5 font-mono text-[11px] text-muted">
                {key}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
