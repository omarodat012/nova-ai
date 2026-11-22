import { useState } from 'react';
import { BadgeCheck, CalendarDays, Check, CircleDashed, Inbox, LoaderCircle, Mail, Tags, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { feedbackCategories, getFeedbackCategory } from '../../data/feedbackCategories.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { deleteFeedback, markFeedbackReviewed } from '../../services/feedbackService.js';
import { formatDate } from '../../utils/formatDate.js';
import { ActionAlert, CollectionState, ConfirmDialog, FilterSelect, IconButton, MetaItem } from './AdminBits.jsx';

const STATUSES = ['new', 'reviewed'];

const STATUS_STYLES = {
  new: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  reviewed: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
};

// Newest first. A just-submitted document has no server timestamp yet, so it sorts to the top.
function byNewest(a, b) {
  const time = (item) => item.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  return time(b) - time(a);
}

export function CategoryBadge({ id }) {
  const { localize } = useLanguage();
  const category = getFeedbackCategory(id);
  const Icon = category.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{ borderColor: `${category.accent}55`, background: `${category.accent}1f` }}
    >
      <Icon className="size-3.5" style={{ color: category.accent }} />
      {localize(category.label)}
    </span>
  );
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const known = STATUSES.includes(status) ? status : 'new';

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[known]}`}>
      {t(`admin.feedback.status.${known}`)}
    </span>
  );
}

function FeedbackRow({ item, busy, disabled, onReview, onDelete }) {
  const { t, lang } = useLanguage();
  const sent = formatDate(item.createdAt, lang);
  const isNew = item.status !== 'reviewed';

  return (
    <li className={`glass rounded-2xl p-4 sm:p-5 ${isNew ? 'border-amber-300/30' : ''}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 font-bold [overflow-wrap:anywhere]">{item.userName || t('admin.feedback.anonymous')}</h3>
            {item.isMember && (
              <span className="inline-flex items-center gap-1 rounded-full border border-bow/45 bg-bow/10 px-2.5 py-1 text-xs font-bold text-bow">
                <BadgeCheck className="size-3.5" />
                {t('admin.feedback.memberBadge')}
              </span>
            )}
            <CategoryBadge id={item.category} />
            <StatusBadge status={item.status} />
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
            {item.userEmail && (
              <MetaItem icon={Mail} dir="ltr">
                {item.userEmail}
              </MetaItem>
            )}
            {sent && (
              <MetaItem icon={CalendarDays}>
                {t('admin.feedback.sentOn')} {sent}
              </MetaItem>
            )}
          </ul>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isNew && (
            <button
              type="button"
              onClick={onReview}
              disabled={disabled}
              className="btn btn-sm border border-emerald-400/45 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t('admin.feedback.review')}
            </button>
          )}
          <IconButton
            icon={Trash2}
            tone="danger"
            label={`${t('admin.common.delete')}: ${item.userName ?? ''}`}
            disabled={disabled}
            onClick={onDelete}
          />
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line rounded-2xl border border-edge bg-space/50 px-4 py-3 leading-relaxed [overflow-wrap:anywhere]">
        {item.message}
      </p>
    </li>
  );
}

// `collection` is the live useCollection('feedback') result owned by the dashboard.
export default function FeedbackTab({ collection }) {
  const { t, localize } = useLanguage();
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { busyId, errorKey, run } = useAdminAction();

  const newCount = collection.items.filter((item) => item.status !== 'reviewed').length;
  const visible = collection.items
    .filter((item) => (!status || (item.status ?? 'new') === status) && (!category || item.category === category))
    .sort(byNewest);

  const confirmDelete = async () => {
    await run(deleteTarget.id, () => deleteFeedback(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect icon={CircleDashed} label={t('admin.feedback.statusFilter')} value={status} onChange={setStatus}>
          <option value="" className="bg-surface text-white">
            {t('admin.feedback.allStatuses')}
          </option>
          {STATUSES.map((item) => (
            <option key={item} value={item} className="bg-surface text-white">
              {t(`admin.feedback.status.${item}`)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect icon={Tags} label={t('admin.feedback.categoryFilter')} value={category} onChange={setCategory}>
          <option value="" className="bg-surface text-white">
            {t('admin.feedback.allCategories')}
          </option>
          {feedbackCategories.map((item) => (
            <option key={item.id} value={item.id} className="bg-surface text-white">
              {localize(item.label)}
            </option>
          ))}
        </FilterSelect>
        {!collection.loading && !collection.error && (
          <p
            className={`ms-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold ${
              newCount > 0 ? 'border-amber-300/40 bg-amber-300/10 text-amber-200' : 'border-edge bg-white/5 text-muted'
            }`}
          >
            <Inbox className="size-4" />
            {t('admin.feedback.newCount')} {newCount}
          </p>
        )}
      </div>

      <ActionAlert errorKey={errorKey} />

      <CollectionState
        collection={collection}
        hasResults={visible.length > 0}
        empty={{ icon: Inbox, title: t('admin.feedback.emptyTitle'), text: t('admin.feedback.emptyText') }}
      >
        <ul className="mt-6 space-y-3">
          {visible.map((item) => (
            <FeedbackRow
              key={item.id}
              item={item}
              busy={busyId === item.id}
              disabled={busyId !== null}
              onReview={() => run(item.id, () => markFeedbackReviewed(item.id))}
              onDelete={() => setDeleteTarget(item)}
            />
          ))}
        </ul>
      </CollectionState>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.feedback.deleteTitle')}
        text={
          <>
            <strong className="block text-white">{deleteTarget?.userName}</strong>
            {t('admin.feedback.deleteText')}
          </>
        }
        busy={busyId !== null}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
