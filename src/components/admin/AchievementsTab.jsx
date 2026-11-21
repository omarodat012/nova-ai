import { useState } from 'react';
import { CalendarDays, Images, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { deleteAchievement } from '../../services/achievementsService.js';
import { getAchievementMedia } from '../../utils/achievementMedia.js';
import { formatDate } from '../../utils/formatDate.js';
import AchievementCover from '../achievements/AchievementCover.jsx';
import AchievementFormModal from './AchievementFormModal.jsx';
import { ActionAlert, CollectionState, ConfirmDialog, IconButton } from './AdminBits.jsx';

function byNewest(a, b) {
  return (b.date ?? '').localeCompare(a.date ?? '');
}

function AchievementItem({ achievement, onEdit, onDelete }) {
  const { t, lang, localize } = useLanguage();
  const title = localize(achievement.title);
  const photoCount = getAchievementMedia(achievement).photos.length;

  return (
    <li className="glass flex flex-col overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/9] overflow-hidden">
        <AchievementCover achievement={achievement} alt={title} />
        {photoCount > 0 && (
          <span
            title={t('achievementPage.gallery')}
            className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-space/70 px-2.5 py-1 text-xs font-bold backdrop-blur-md"
          >
            <Images className="size-3.5 text-logo-blue" />
            <span className="sr-only">{t('achievementPage.gallery')}:</span>
            {photoCount}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex items-center gap-2 text-sm text-logo-blue">
          <CalendarDays className="size-4" />
          {formatDate(achievement.date, lang) || t('achievements.dateTba')}
        </span>
        <h3 className="mt-2 text-lg font-bold leading-snug [overflow-wrap:anywhere]">{title}</h3>
        <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted">{localize(achievement.description)}</p>
        <div className="mt-auto flex justify-end gap-2 pt-4">
          <IconButton icon={Pencil} label={`${t('admin.common.edit')}: ${title}`} onClick={onEdit} />
          <IconButton icon={Trash2} tone="danger" label={`${t('admin.common.delete')}: ${title}`} onClick={onDelete} />
        </div>
      </div>
    </li>
  );
}

// `collection` is the live useCollection('achievements') result owned by the dashboard.
export default function AchievementsTab({ collection }) {
  const { t, localize } = useLanguage();
  // `editor` is null when closed, { achievement: null } to add, or { achievement } to edit.
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { busyId, errorKey, run } = useAdminAction();

  const posts = [...collection.items].sort(byNewest);

  const confirmDelete = async () => {
    await run(deleteTarget.id, () => deleteAchievement(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 basis-60 text-sm leading-relaxed text-muted">{t('admin.achievements.hint')}</p>
        <button
          type="button"
          onClick={() => setEditor({ achievement: null })}
          className="btn btn-primary w-full sm:w-auto"
        >
          <Plus className="size-5" />
          {t('admin.achievements.add')}
        </button>
      </div>

      <ActionAlert errorKey={errorKey} />

      <CollectionState
        collection={collection}
        hasResults
        empty={{ icon: Trophy, title: t('admin.achievements.emptyTitle'), text: t('admin.achievements.emptyText') }}
      >
        <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((achievement) => (
            <AchievementItem
              key={achievement.id}
              achievement={achievement}
              onEdit={() => setEditor({ achievement })}
              onDelete={() => setDeleteTarget(achievement)}
            />
          ))}
        </ul>
      </CollectionState>

      <AchievementFormModal
        open={Boolean(editor)}
        achievement={editor?.achievement ?? null}
        onClose={() => setEditor(null)}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.achievements.deleteTitle')}
        text={
          <>
            <strong className="block text-white">{localize(deleteTarget?.title)}</strong>
            {t('admin.achievements.deleteText')}
          </>
        }
        busy={busyId !== null}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
