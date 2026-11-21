import { useState } from 'react';
import { CalendarDays, Check, CircleDashed, ClipboardList, ListFilter, LoaderCircle, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { approveApplication, deleteApplication, rejectApplication } from '../../services/applicationsService.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  ActionAlert,
  CollectionState,
  ConfirmDialog,
  FilterSelect,
  IconButton,
  MetaItem,
  PersonMeta,
  SubteamChip,
  SubteamFilterOptions,
} from './AdminBits.jsx';

const STATUSES = ['pending', 'approved', 'rejected'];

const STATUS_STYLES = {
  pending: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  approved: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-bow/45 bg-bow/10 text-bow',
};

// Newest first. A just-submitted document has no server timestamp yet, so it sorts to the top.
function byNewest(a, b) {
  const time = (item) => item.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  return time(b) - time(a);
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const known = STATUSES.includes(status) ? status : 'pending';

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[known]}`}>
      {t(`admin.applications.status.${known}`)}
    </span>
  );
}

function ApplicationRow({ application, busy, disabled, onApprove, onReject, onDelete }) {
  const { t, lang } = useLanguage();
  const submitted = formatDate(application.createdAt, lang);

  return (
    <li className="glass flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 font-bold [overflow-wrap:anywhere]">{application.fullName}</h3>
          <StatusBadge status={application.status} />
          <SubteamChip id={application.subteam} />
        </div>
        <PersonMeta person={application}>
          {submitted && (
            <MetaItem icon={CalendarDays}>
              {t('admin.applications.submitted')} {submitted}
            </MetaItem>
          )}
        </PersonMeta>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {application.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={onApprove}
              disabled={disabled}
              className="btn btn-sm border border-emerald-400/45 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t('admin.applications.approve')}
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={disabled}
              className="btn btn-sm border border-bow/45 bg-bow/10 text-bow hover:bg-bow/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-4" />
              {t('admin.applications.reject')}
            </button>
          </>
        )}
        <IconButton
          icon={Trash2}
          tone="danger"
          label={`${t('admin.common.delete')}: ${application.fullName}`}
          disabled={disabled}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}

// `collection` is the live useCollection('applications') result owned by the dashboard.
export default function ApplicationsTab({ collection }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('');
  const [subteam, setSubteam] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { busyId, errorKey, run } = useAdminAction();

  const visible = collection.items
    .filter((item) => (!status || item.status === status) && (!subteam || item.subteam === subteam))
    .sort(byNewest);

  const confirmDelete = async () => {
    await run(deleteTarget.id, () => deleteApplication(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect icon={CircleDashed} label={t('admin.applications.statusFilter')} value={status} onChange={setStatus}>
          <option value="" className="bg-surface text-white">
            {t('admin.applications.allStatuses')}
          </option>
          {STATUSES.map((item) => (
            <option key={item} value={item} className="bg-surface text-white">
              {t(`admin.applications.status.${item}`)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect icon={ListFilter} label={t('admin.common.subteamFilter')} value={subteam} onChange={setSubteam}>
          <SubteamFilterOptions />
        </FilterSelect>
      </div>

      <ActionAlert errorKey={errorKey} />

      <CollectionState
        collection={collection}
        hasResults={visible.length > 0}
        empty={{
          icon: ClipboardList,
          title: t('admin.applications.emptyTitle'),
          text: t('admin.applications.emptyText'),
        }}
      >
        <ul className="mt-6 space-y-3">
          {visible.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              busy={busyId === application.id}
              disabled={busyId !== null}
              onApprove={() => run(application.id, () => approveApplication(application.id))}
              onReject={() => run(application.id, () => rejectApplication(application.id))}
              onDelete={() => setDeleteTarget(application)}
            />
          ))}
        </ul>
      </CollectionState>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.applications.deleteTitle')}
        text={
          <>
            <strong className="block text-white">{deleteTarget?.fullName}</strong>
            {t('admin.applications.deleteText')}
          </>
        }
        busy={busyId !== null}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
