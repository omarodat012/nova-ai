import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Crown, Hourglass, LayoutDashboard, Trophy, Users } from 'lucide-react';
import AchievementsTab from '../components/admin/AchievementsTab.jsx';
import { StatCard } from '../components/admin/AdminBits.jsx';
import ApplicationsTab from '../components/admin/ApplicationsTab.jsx';
import LeadersTab from '../components/admin/LeadersTab.jsx';
import MembersTab from '../components/admin/MembersTab.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCollection } from '../hooks/useCollection.js';
import { SUBTEAM_LEADERS } from '../services/subteamLeadersService.js';

const EASE = [0.22, 1, 0.36, 1];

const TABS = [
  { id: 'members', icon: Users, Panel: MembersTab },
  { id: 'applications', icon: ClipboardList, Panel: ApplicationsTab },
  { id: 'achievements', icon: Trophy, Panel: AchievementsTab },
  { id: 'leaders', icon: Crown, Panel: LeadersTab },
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState('members');

  // One live subscription per collection feeds both the stat cards and the tabs.
  const collections = {
    members: useCollection('members'),
    applications: useCollection('applications'),
    achievements: useCollection('achievements'),
    leaders: useCollection(SUBTEAM_LEADERS),
  };
  const pendingCount = collections.applications.items.filter((item) => item.status === 'pending').length;
  const badges = {
    members: collections.members.items.length,
    applications: pendingCount,
    achievements: collections.achievements.items.length,
  };

  const { Panel } = TABS.find((tab) => tab.id === activeId);

  return (
    <section className="relative pb-24 pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(124,58,237,0.22),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-5">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="flex w-fit items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue backdrop-blur-md">
            <LayoutDashboard className="size-4" />
            {t('admin.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-snug sm:text-5xl sm:leading-snug">
            <span className="text-gradient">{t('admin.title')}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-loose text-muted">{t('admin.subtitle')}</p>
        </motion.header>

        <motion.div
          className="mt-10 grid gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
        >
          <StatCard
            icon={Users}
            accent="#4F8CFF"
            label={t('admin.stats.members')}
            value={collections.members.items.length}
            loading={collections.members.loading}
          />
          <StatCard
            icon={Hourglass}
            accent="#FBBF24"
            label={t('admin.stats.pending')}
            value={pendingCount}
            loading={collections.applications.loading}
          />
          <StatCard
            icon={Trophy}
            accent="#F472B6"
            label={t('admin.stats.achievements')}
            value={collections.achievements.items.length}
            loading={collections.achievements.loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
        >
          <div
            role="tablist"
            aria-label={t('admin.tabsLabel')}
            className="glass mt-10 flex gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none] sm:w-fit [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map(({ id, icon: Icon }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`admin-tab-${id}`}
                  aria-selected={active}
                  aria-controls="admin-panel"
                  onClick={(event) => {
                    setActiveId(id);
                    event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                    active ? 'text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-tab-pill"
                      className="bg-brand absolute inset-0 rounded-full shadow-[0_10px_30px_-12px_rgba(79,140,255,0.9)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative">{t(`admin.tabs.${id}`)}</span>
                  {badges[id] > 0 && (
                    <span
                      className={`relative grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs ${
                        active ? 'bg-white/20' : 'bg-white/10'
                      }`}
                    >
                      {badges[id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeId}
              role="tabpanel"
              id="admin-panel"
              aria-labelledby={`admin-tab-${activeId}`}
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <Panel collection={collections[activeId]} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
