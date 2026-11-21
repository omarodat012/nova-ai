import { useState } from 'react';
import { BookOpen, Crown, GraduationCap, Info, Mail, Pencil, Phone, Trash2, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { subteams } from '../../data/subteams.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { saveSubteamLeaders, toLeaders } from '../../services/subteamLeadersService.js';
import SmartImage from '../ui/SmartImage.jsx';
import { ActionAlert, CollectionState, ConfirmDialog, IconButton, MetaItem } from './AdminBits.jsx';
import LeaderFormModal from './LeaderFormModal.jsx';

function LeaderRow({ leader, busy, onEdit, onDelete }) {
  const { t, localize } = useLanguage();
  const name = localize(leader.name);
  const otherName = leader.name.ar === name ? leader.name.en : leader.name.ar;
  const initial = (
    <span aria-hidden="true" className="bg-logo grid size-full place-items-center font-display text-lg font-extrabold">
      {name.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <li className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="block size-12 shrink-0 overflow-hidden rounded-2xl">
          {leader.photo ? (
            <SmartImage key={leader.photo} src={leader.photo} alt="" className="size-full object-cover" fallback={initial} />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold [overflow-wrap:anywhere]">
            {name}
            {otherName !== name && <span className="ms-2 text-sm font-medium text-muted">{otherName}</span>}
          </h3>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
            {localize(leader.major) && <MetaItem icon={BookOpen}>{localize(leader.major)}</MetaItem>}
            {localize(leader.academicYear) && <MetaItem icon={GraduationCap}>{localize(leader.academicYear)}</MetaItem>}
            {leader.email && (
              <MetaItem icon={Mail} dir="ltr">
                {leader.email}
              </MetaItem>
            )}
            {leader.phone && (
              <MetaItem icon={Phone} dir="ltr">
                {leader.phone}
              </MetaItem>
            )}
          </ul>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2">
        <IconButton icon={Pencil} label={`${t('admin.common.edit')}: ${name}`} disabled={busy} onClick={onEdit} />
        <IconButton
          icon={Trash2}
          tone="danger"
          label={`${t('admin.common.delete')}: ${name}`}
          disabled={busy}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}

// `collection` is the live useCollection('subteam_leaders') result owned by the dashboard: one document per SubTeam.
export default function LeadersTab({ collection }) {
  const { t, localize } = useLanguage();
  const [teamId, setTeamId] = useState(subteams[0].id);
  // `editor` is null when closed, { index: null } to add, or { index } to edit that leader.
  const [editor, setEditor] = useState(null);
  // `deleteTarget` is { index, leader }; the leader is kept so the dialog keeps its name while the list updates.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { busyId, errorKey, run } = useAdminAction();

  // A saved document replaces the team's default leaders, even when its list is empty.
  const leadersOf = (team) => {
    const saved = collection.items.find((item) => item.id === team.id);
    return { leaders: toLeaders(saved ? saved.leaders : team.leaders), isDefault: !saved };
  };

  const team = subteams.find((item) => item.id === teamId);
  const { leaders, isDefault } = leadersOf(team);
  const ready = !collection.loading && !collection.error;

  const saveLeader = (leader) => {
    const next =
      editor.index === null
        ? [...leaders, leader]
        : leaders.map((item, index) => (index === editor.index ? leader : item));
    return saveSubteamLeaders(teamId, next);
  };

  const confirmDelete = async () => {
    const next = leaders.filter((_, index) => index !== deleteTarget.index);
    await run(teamId, () => saveSubteamLeaders(teamId, next));
    setDeleteTarget(null);
  };

  return (
    <div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted">{t('admin.leaders.hint')}</p>

      <div role="group" aria-label={t('admin.leaders.teamsLabel')} className="mt-5 flex flex-wrap gap-2">
        {subteams.map((item) => {
          const selected = item.id === teamId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTeamId(item.id)}
              style={{ '--accent': item.accent }}
              className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                selected
                  ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-white'
                  : 'border-edge bg-white/5 text-muted hover:border-[color:var(--accent)] hover:text-white'
              }`}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span className="truncate">{localize(item.name)}</span>
              {ready && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{leadersOf(item).leaders.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {ready && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="min-w-0 flex-1 basis-60 text-xl font-bold">
            {localize(team.name)} <span aria-hidden="true">{team.emoji}</span>
          </h3>
          <button type="button" onClick={() => setEditor({ index: null })} className="btn btn-primary w-full sm:w-auto">
            <UserPlus className="size-5" />
            {t('admin.leaders.add')}
          </button>
        </div>
      )}

      {ready && isDefault && (
        <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-edge bg-white/5 px-4 py-3 text-sm leading-relaxed text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-logo-blue" />
          {t('admin.leaders.defaultsNote')}
        </p>
      )}

      <ActionAlert errorKey={errorKey} />

      <CollectionState
        collection={{ ...collection, items: leaders }}
        hasResults
        empty={{ icon: Crown, title: t('admin.leaders.emptyTitle'), text: t('admin.leaders.emptyText') }}
      >
        <ul className="mt-6 space-y-3">
          {leaders.map((leader, index) => (
            <LeaderRow
              key={`${index}-${leader.name.en}`}
              leader={leader}
              busy={busyId !== null}
              onEdit={() => setEditor({ index })}
              onDelete={() => setDeleteTarget({ index, leader })}
            />
          ))}
        </ul>
      </CollectionState>

      <LeaderFormModal
        open={Boolean(editor)}
        leader={editor && editor.index !== null ? leaders[editor.index] : null}
        teamName={localize(team.name)}
        onSave={saveLeader}
        onClose={() => setEditor(null)}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.leaders.deleteTitle')}
        text={
          <>
            <strong className="block text-white">{localize(deleteTarget?.leader.name)}</strong>
            {t('admin.leaders.deleteText')}
          </>
        }
        busy={busyId !== null}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
