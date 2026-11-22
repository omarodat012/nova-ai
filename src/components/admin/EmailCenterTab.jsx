import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CircleAlert,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Layers,
  ListChecks,
  LoaderCircle,
  MailX,
  Send,
  SquareCheckBig,
  SquareDashed,
  TriangleAlert,
  Type,
  Users,
  UsersRound,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { subteams } from '../../data/subteams.js';
import { gmailComposeUrl, isEmailJsConfigured, sendEmails } from '../../services/emailService.js';
import { toEmailLower } from '../../services/membersService.js';
import { TextAreaField, TextField } from '../forms/FormFields.jsx';
import Toast from '../ui/Toast.jsx';
import { ActionAlert, SearchInput, SubteamChip } from './AdminBits.jsx';

const EASE = [0.22, 1, 0.36, 1];
const MODES = [
  { id: 'all', icon: Users },
  { id: 'subteam', icon: Layers },
  { id: 'custom', icon: ListChecks },
];

// Members that can actually be emailed: one entry per address, sorted by name.
function toRecipients(members) {
  const seen = new Set();
  return members
    .filter((member) => {
      const email = toEmailLower(member.email);
      if (!email || seen.has(email)) return false;
      seen.add(email);
      return true;
    })
    .map((member) => ({ ...member, email: member.email.trim() }))
    .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
}

function matchesSearch(member, search) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [member.fullName, member.email].some((value) => value?.toLowerCase().includes(needle));
}

function toggleIn(set, id) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <h3 className="flex items-center gap-3 text-lg font-bold">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-edge bg-electric/15 text-logo-blue">
          <Icon className="size-5" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusBox({ tone, icon: Icon, spin = false, children }) {
  return (
    <motion.div
      role="status"
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${tone}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${spin ? 'animate-spin' : ''}`} />
      <div className="min-w-0 flex-1">{children}</div>
    </motion.div>
  );
}

function SubteamPicker({ everyone, teams, onToggle }) {
  const { localize } = useLanguage();

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {subteams.map((team) => {
        const count = everyone.filter((member) => member.subteam === team.id).length;
        const checked = teams.has(team.id);
        return (
          <label
            key={team.id}
            style={{ '--accent': team.accent }}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
              checked ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]' : 'border-edge bg-space/40 hover:border-[color:var(--accent)]'
            }`}
          >
            <input type="checkbox" checked={checked} onChange={() => onToggle(team.id)} className="peer sr-only" />
            <span
              aria-hidden="true"
              className={`grid size-6 shrink-0 place-items-center rounded-lg border transition-colors ${
                checked ? 'border-transparent bg-[var(--accent)] text-space' : 'border-edge bg-space'
              } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric`}
            >
              {checked && <Check className="size-4" strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold [overflow-wrap:anywhere]">
                {team.emoji} {localize(team.name)}
              </span>
            </span>
            <span className="rounded-full border border-edge bg-white/5 px-2.5 py-0.5 text-xs font-bold text-muted">{count}</span>
          </label>
        );
      })}
    </div>
  );
}

function CustomPicker({ everyone, picked, onToggle, onSetAll }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const visible = everyone.filter((member) => matchesSearch(member, search));

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t('admin.email.search')} />
        <button type="button" onClick={() => onSetAll(new Set(everyone.map((member) => member.id)))} className="btn btn-ghost btn-sm">
          <SquareCheckBig className="size-4" />
          {t('admin.email.selectAll')}
        </button>
        <button type="button" onClick={() => onSetAll(new Set())} className="btn btn-ghost btn-sm">
          <SquareDashed className="size-4" />
          {t('admin.email.clearAll')}
        </button>
      </div>

      <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto pe-1 [scrollbar-width:thin]">
        {visible.length === 0 && <li className="py-6 text-center text-sm text-muted">{t('admin.common.noResultsTitle')}</li>}
        {visible.map((member) => {
          const checked = picked.has(member.id);
          return (
            <li key={member.id}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-colors ${
                  checked ? 'border-electric/60 bg-electric/10' : 'border-edge bg-space/40 hover:border-electric/40'
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => onToggle(member.id)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center rounded-lg border transition-colors ${
                    checked ? 'bg-brand border-transparent' : 'border-edge bg-space'
                  } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric`}
                >
                  {checked && <Check className="size-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold [overflow-wrap:anywhere]">{member.fullName}</span>
                    <SubteamChip id={member.subteam} />
                  </span>
                  <span dir="ltr" className="mt-0.5 block text-sm text-muted [overflow-wrap:anywhere] rtl:text-right">
                    {member.email}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Admin-only mass email: pick the recipients, write once, then send through EmailJS (when configured) or hand the
// list over to Gmail / the clipboard. `collection` is the live useCollection('members') result owned by the dashboard.
export default function EmailCenterTab({ collection }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('all');
  const [teams, setTeams] = useState(() => new Set());
  const [picked, setPicked] = useState(() => new Set());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attempted, setAttempted] = useState(false);
  // null while idle, { done, total } while EmailJS is working.
  const [progress, setProgress] = useState(null);
  // null, or the summary of the last direct send: { sent, failed, attempted, total }.
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);
  const closeCopied = useCallback(() => setCopied(false), []);

  const everyone = useMemo(() => toRecipients(collection.items), [collection.items]);
  const withoutEmail = collection.items.filter((member) => !toEmailLower(member.email)).length;
  const recipients =
    mode === 'all'
      ? everyone
      : mode === 'subteam'
        ? everyone.filter((member) => teams.has(member.subteam))
        : everyone.filter((member) => picked.has(member.id));

  const errors = {
    subject: subject.trim() ? undefined : 'required',
    body: body.trim() ? undefined : 'required',
  };
  const sending = progress !== null;
  const ready = !collection.loading && !collection.error;

  // Validates the composer and the recipient list; returns the trimmed message or null.
  const prepare = (needsBody) => {
    setAttempted(true);
    setNotice(null);
    if (recipients.length === 0) {
      setNotice('noRecipients');
      return null;
    }
    if (needsBody && (errors.subject || errors.body)) return null;
    return { subject: subject.trim(), message: body.trim() };
  };

  const handleSendDirect = async () => {
    const draft = prepare(true);
    if (!draft) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setResult(null);
    setProgress({ done: 0, total: recipients.length });
    const summary = await sendEmails(recipients, draft, (done) => setProgress({ done, total: recipients.length }), controller.signal);
    abortRef.current = null;
    setProgress(null);
    setResult({ ...summary, total: recipients.length });
  };

  const handleGmail = () => {
    const draft = prepare(false);
    if (!draft) return;
    const url = gmailComposeUrl({ bcc: recipients.map((member) => member.email), subject: draft.subject, body: draft.message });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    if (!prepare(false)) return;
    try {
      await navigator.clipboard.writeText(recipients.map((member) => member.email).join(', '));
      setCopied(true);
    } catch (error) {
      console.error('[NOVA AI] Could not copy the email list.', error);
      setNotice('copyFailed');
    }
  };

  const counter = [t('admin.email.selectedPrefix'), String(recipients.length), t('admin.email.selectedSuffix')]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <p className="max-w-3xl leading-relaxed text-muted">{t('admin.email.hint')}</p>
      <ActionAlert errorKey={collection.error ? (collection.error.code === 'permission-denied' ? 'permission' : 'load') : null} />

      <fieldset disabled={!ready || sending} className="mt-6 min-w-0 disabled:opacity-80">
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Panel icon={UsersRound} title={t('admin.email.recipients')}>
          <div role="tablist" aria-label={t('admin.email.recipients')} className="mt-5 flex gap-1 rounded-full border border-edge bg-space/50 p-1">
            {MODES.map(({ id, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(id)}
                  className={`relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                    active ? 'text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="email-mode-pill"
                      className="bg-brand absolute inset-0 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative size-4 shrink-0" />
                  <span className="relative truncate">{t(`admin.email.modes.${id}`)}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <p className="mt-4 text-sm leading-relaxed text-muted">{t(`admin.email.modeHints.${mode}`)}</p>
              {mode === 'subteam' && <SubteamPicker everyone={everyone} teams={teams} onToggle={(id) => setTeams((current) => toggleIn(current, id))} />}
              {mode === 'custom' && (
                <CustomPicker everyone={everyone} picked={picked} onToggle={(id) => setPicked((current) => toggleIn(current, id))} onSetAll={setPicked} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-edge pt-5">
            <p
              aria-live="polite"
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                recipients.length > 0 ? 'border-electric/50 bg-electric/15 text-white' : 'border-edge bg-white/5 text-muted'
              }`}
            >
              <UsersRound className="size-4 text-logo-blue" />
              {counter}
            </p>
            {withoutEmail > 0 && (
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <MailX className="size-4 text-amber-300" />
                {t('admin.email.noEmail')} {withoutEmail}
              </p>
            )}
          </div>
        </Panel>

        <Panel icon={Send} title={t('admin.email.composer')}>
          <div className="mt-5 space-y-5">
            <TextField
              icon={Type}
              label={t('admin.email.subject')}
              type="text"
              name="subject"
              value={subject}
              maxLength={200}
              placeholder={t('admin.email.subjectPlaceholder')}
              error={attempted ? errors.subject : undefined}
              onChange={(event) => setSubject(event.target.value)}
            />
            <TextAreaField
              label={t('admin.email.body')}
              name="body"
              rows={9}
              value={body}
              maxLength={5000}
              placeholder={t('admin.email.bodyPlaceholder')}
              error={attempted ? errors.body : undefined}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>

          <div className="mt-5 space-y-3">
            <AnimatePresence initial={false}>
              {notice && (
                <StatusBox key={notice} tone="border-bow/40 bg-bow/10 text-white" icon={CircleAlert}>
                  {t(`admin.email.${notice}`)}
                </StatusBox>
              )}
              {sending && (
                <StatusBox key="progress" tone="border-amber-300/35 bg-amber-300/10 text-amber-100" icon={LoaderCircle} spin>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {t('admin.email.sending')}{' '}
                      <span dir="ltr">
                        {progress.done}/{progress.total}
                      </span>
                    </span>
                    <button type="button" onClick={() => abortRef.current?.abort()} className="inline-flex items-center gap-1 text-xs font-bold text-white hover:underline">
                      <X className="size-3.5" />
                      {t('admin.email.cancel')}
                    </button>
                  </div>
                  <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.span
                      className="bg-brand block h-full rounded-full"
                      initial={false}
                      animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  </span>
                </StatusBox>
              )}
              {result && !sending && (
                <StatusBox
                  key="result"
                  tone={
                    result.failed.length === 0 && result.attempted === result.total
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                      : 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                  }
                  icon={result.failed.length === 0 && result.attempted === result.total ? Check : TriangleAlert}
                >
                  <span>
                    {t('admin.email.sentSummary')}{' '}
                    <span dir="ltr">
                      {result.sent}/{result.total}
                    </span>
                    {result.attempted < result.total && ` · ${t('admin.email.cancelled')}`}
                  </span>
                  {result.failed.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs">
                      <li className="font-bold">{t('admin.email.failedList')}</li>
                      {result.failed.map(({ recipient }) => (
                        <li key={recipient.id} dir="ltr" className="rtl:text-right">
                          {recipient.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </StatusBox>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {isEmailJsConfigured ? (
              <button type="button" onClick={handleSendDirect} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {sending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5 rtl:-scale-x-100" />}
                {t('admin.email.sendDirect')}
              </button>
            ) : (
              <p className="flex items-start gap-2.5 rounded-2xl border border-edge bg-white/5 px-4 py-3 text-sm leading-relaxed text-muted">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-logo-blue" />
                {t('admin.email.notConfigured')}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={handleGmail} className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-70">
                <ExternalLink className="size-4" />
                {t('admin.email.gmail')}
              </button>
              <button type="button" onClick={handleCopy} className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-70">
                <Copy className="size-4" />
                {t('admin.email.copy')}
              </button>
            </div>
          </div>
        </Panel>
        </div>
      </fieldset>

      <Toast open={copied} onClose={closeCopied} icon={ClipboardCheck} title={t('admin.email.copied')}>
        {t('admin.email.copiedText')} {recipients.length}
      </Toast>
    </div>
  );
}
