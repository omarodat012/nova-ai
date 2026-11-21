import {
  ChevronDown,
  CircleAlert,
  GraduationCap,
  LoaderCircle,
  Mail,
  Phone,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { academicYears } from '../../data/academicYears.js';
import { getSubteamById, subteams } from '../../data/subteams.js';
import Modal from '../ui/Modal.jsx';

export function StatCard({ icon: Icon, label, value, loading, accent }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full opacity-25 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl border"
          style={{ borderColor: `${accent}55`, background: `${accent}22`, color: accent }}
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          {loading ? (
            <span className="mt-2 block h-8 w-14 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="font-display text-3xl font-extrabold leading-tight">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-0 flex-1 basis-60">
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-logo-blue" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field ps-10"
      />
    </div>
  );
}

export function FilterSelect({ icon: Icon, label, value, onChange, children }) {
  return (
    <div className="relative min-w-0 flex-1 basis-48 sm:flex-none">
      <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-logo-blue" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="field cursor-pointer appearance-none px-10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

// The <option> list for a SubTeam filter: "all" first, then the five teams.
export function SubteamFilterOptions() {
  const { t, localize } = useLanguage();

  return (
    <>
      <option value="" className="bg-surface text-white">
        {t('admin.common.allSubteams')}
      </option>
      {subteams.map((team) => (
        <option key={team.id} value={team.id} className="bg-surface text-white">
          {localize(team.name)} {team.emoji}
        </option>
      ))}
    </>
  );
}

export function SubteamChip({ id }) {
  const { localize } = useLanguage();
  const team = getSubteamById(id);
  if (!team) return null;

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{ borderColor: `${team.accent}55`, background: `${team.accent}1f` }}
    >
      <span aria-hidden="true">{team.emoji}</span>
      <span className="truncate">{localize(team.name)}</span>
    </span>
  );
}

export function MetaItem({ icon: Icon, dir, children }) {
  return (
    <li className="flex min-w-0 items-center gap-1.5">
      <Icon className="size-4 shrink-0 text-logo-blue" />
      <span dir={dir} className="min-w-0 [overflow-wrap:anywhere]">
        {children}
      </span>
    </li>
  );
}

// Contact and study details shared by member and application rows; `children` adds extra MetaItems.
export function PersonMeta({ person, children }) {
  const { localize } = useLanguage();
  const year = academicYears.find((item) => item.id === person.academicYear);
  const study = person.isStudent
    ? [person.major, person.university, year && localize(year.label)].filter(Boolean).join(' · ')
    : '';

  return (
    <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
      {person.phone && (
        <MetaItem icon={Phone} dir="ltr">
          {person.phone}
        </MetaItem>
      )}
      {person.email && (
        <MetaItem icon={Mail} dir="ltr">
          {person.email}
        </MetaItem>
      )}
      {study && <MetaItem icon={GraduationCap}>{study}</MetaItem>}
      {children}
    </ul>
  );
}

const ICON_BUTTON_TONES = {
  neutral: 'text-muted hover:border-electric hover:text-white',
  danger: 'text-muted hover:border-bow hover:bg-bow/10 hover:text-bow',
};

export function IconButton({ icon: Icon, label, tone = 'neutral', busy = false, ...buttonProps }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-10 shrink-0 place-items-center rounded-full border border-edge bg-space/50 transition disabled:cursor-not-allowed disabled:opacity-50 ${ICON_BUTTON_TONES[tone]}`}
      {...buttonProps}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Icon className="size-4" />}
    </button>
  );
}

export function ActionAlert({ errorKey }) {
  const { t } = useLanguage();
  if (!errorKey) return null;

  return (
    <p
      role="alert"
      className="mt-4 flex items-start gap-2.5 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium leading-relaxed"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-bow" />
      {t(`admin.errors.${errorKey}`)}
    </p>
  );
}

function ListSkeleton() {
  return (
    <ul className="mt-6 space-y-3" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <li key={row} className="glass h-24 animate-pulse rounded-2xl" />
      ))}
    </ul>
  );
}

function Notice({ icon: Icon, title, text, tone = 'text-logo-blue' }) {
  return (
    <div className="glass mt-6 flex flex-col items-center rounded-3xl px-6 py-14 text-center">
      <span className={`grid size-16 place-items-center rounded-3xl border border-edge bg-white/5 ${tone}`}>
        <Icon className="size-8" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md leading-relaxed text-muted">{text}</p>
    </div>
  );
}

// Picks what a tab shows: skeleton, load error, an empty state, or the list itself.
// `collection` is a useCollection() result; `empty` is { icon, title, text } for a collection with no documents.
export function CollectionState({ collection, empty, hasResults, children }) {
  const { t } = useLanguage();

  if (collection.loading) return <ListSkeleton />;
  if (collection.error) {
    const key = collection.error.code === 'permission-denied' ? 'permission' : 'load';
    return (
      <Notice icon={ShieldAlert} tone="text-bow" title={t('admin.errors.loadTitle')} text={t(`admin.errors.${key}`)} />
    );
  }
  if (collection.items.length === 0) return <Notice {...empty} />;
  if (!hasResults) {
    return <Notice icon={Search} title={t('admin.common.noResultsTitle')} text={t('admin.common.noResultsText')} />;
  }
  return children;
}

export function ConfirmDialog({ open, title, text, busy, onConfirm, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} labelledBy="confirm-title" className="max-w-sm">
      <div className="px-6 pb-7 pt-12 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-bow/40 bg-bow/10 text-bow">
          <Trash2 className="size-6" />
        </span>
        <h2 id="confirm-title" className="mt-4 text-xl font-bold">
          {title}
        </h2>
        <p className="mt-2 leading-relaxed text-muted">{text}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-ghost">
            {t('admin.common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn bg-bow text-space shadow-[0_12px_32px_-12px_rgba(244,114,182,0.8)] disabled:cursor-wait disabled:opacity-80"
          >
            {busy && <LoaderCircle className="size-5 animate-spin" />}
            {t('admin.common.delete')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
