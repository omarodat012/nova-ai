import { useEffect, useState } from 'react';
import { ListFilter, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getRoleById } from '../../data/memberRoles.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { deleteMember, syncMemberEmails } from '../../services/membersService.js';
import { syncPublicMembers } from '../../services/publicMembersService.js';
import {
  ActionAlert,
  CollectionState,
  ConfirmDialog,
  FilterSelect,
  IconButton,
  PersonMeta,
  SearchInput,
  SubteamChip,
  SubteamFilterOptions,
} from './AdminBits.jsx';
import MemberFormModal from './MemberFormModal.jsx';
import RosterSettingsBar from './RosterSettingsBar.jsx';

function matchesSearch(member, search) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [member.fullName, member.email, member.phone].some((value) => value?.toLowerCase().includes(needle));
}

function byName(a, b) {
  return (a.fullName ?? '').localeCompare(b.fullName ?? '');
}

const ROLE_CHIP_TONES = {
  supervisor: 'border-amber-300/50 bg-amber-300/10 text-amber-200',
  leader: 'border-bow/45 bg-bow/10 text-bow',
  member: 'border-edge bg-white/5 text-muted',
};

function MemberRow({ member, onEdit, onDelete }) {
  const { t, localize } = useLanguage();
  const role = getRoleById(member.role);

  return (
    <li className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span
          aria-hidden="true"
          className="bg-logo grid size-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold"
        >
          {member.fullName?.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 font-bold [overflow-wrap:anywhere]">{member.fullName}</h3>
            {role && (
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ROLE_CHIP_TONES[member.role] ?? ROLE_CHIP_TONES.member}`}
              >
                {localize(role.label)}
              </span>
            )}
            <SubteamChip id={member.subteam} />
          </div>
          <PersonMeta person={member} />
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2">
        <IconButton icon={Pencil} label={`${t('admin.common.edit')}: ${member.fullName}`} onClick={onEdit} />
        <IconButton
          icon={Trash2}
          tone="danger"
          label={`${t('admin.common.delete')}: ${member.fullName}`}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}

// `collection` is the live useCollection('members') result owned by the dashboard.
export default function MembersTab({ collection }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [subteam, setSubteam] = useState('');
  // `editor` is null when closed, { member: null } to add, or { member } to edit.
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { busyId, errorKey, run } = useAdminAction();
  const [syncFailed, setSyncFailed] = useState(false);

  // Opening the tab repairs `member_emails`, the lookup firestore.rules uses to recognize members (members added
  // before it existed have no entry yet), and `public_members`, the cards of the home page team strip.
  // It waits for the real list: syncing against an empty one would wipe both.
  const ready = !collection.loading && !collection.error;
  const members = collection.items;
  useEffect(() => {
    if (!ready) return;
    Promise.all([syncMemberEmails(members), syncPublicMembers(members)]).catch((error) => {
      console.error('[NOVA AI] Could not sync the members lookup and the public team list.', error);
      setSyncFailed(true);
    });
    // Once per visit to the tab; later adds, edits and deletes keep both up to date themselves.
  }, [ready]);

  const visible = collection.items
    .filter((member) => (!subteam || member.subteam === subteam) && matchesSearch(member, search))
    .sort(byName);

  const confirmDelete = async () => {
    await run(deleteTarget.id, () => deleteMember(deleteTarget.id, deleteTarget.emailLower ?? deleteTarget.email));
    setDeleteTarget(null);
  };

  return (
    <div>
      <RosterSettingsBar />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('admin.members.search')} />
        <FilterSelect icon={ListFilter} label={t('admin.common.subteamFilter')} value={subteam} onChange={setSubteam}>
          <SubteamFilterOptions />
        </FilterSelect>
        <button type="button" onClick={() => setEditor({ member: null })} className="btn btn-primary w-full sm:w-auto">
          <UserPlus className="size-5" />
          {t('admin.members.add')}
        </button>
      </div>

      <ActionAlert errorKey={errorKey ?? (syncFailed ? 'permission' : null)} />

      <CollectionState
        collection={collection}
        hasResults={visible.length > 0}
        empty={{ icon: Users, title: t('admin.members.emptyTitle'), text: t('admin.members.emptyText') }}
      >
        <ul className="mt-6 space-y-3">
          {visible.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onEdit={() => setEditor({ member })}
              onDelete={() => setDeleteTarget(member)}
            />
          ))}
        </ul>
      </CollectionState>

      <MemberFormModal
        open={Boolean(editor)}
        member={editor?.member ?? null}
        supervisor={collection.items.find((member) => member.role === 'supervisor') ?? null}
        onClose={() => setEditor(null)}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.members.deleteTitle')}
        text={
          <>
            <strong className="block text-white">{deleteTarget?.fullName}</strong>
            {t('admin.members.deleteText')}
          </>
        }
        busy={busyId !== null}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
