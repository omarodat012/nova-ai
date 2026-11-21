import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Contact, Eye, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { subteams } from '../../data/subteams.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useRosterSettings } from '../../hooks/useRoster.js';
import { saveRosterSettings } from '../../services/rosterSettingsService.js';
import SwitchTrack from '../ui/SwitchTrack.jsx';
import { ActionAlert } from './AdminBits.jsx';

function SettingSwitch({ checked, disabled, onChange, accent, children }) {
  return (
    <label
      style={accent ? { '--accent': accent } : undefined}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-edge bg-space/40 px-4 py-3 transition-colors hover:border-[color:var(--accent,var(--color-logo-blue))]"
    >
      <span className="min-w-0">{children}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <SwitchTrack />
    </label>
  );
}

// Collapsible bar at the top of the Members tab. Every switch is saved to settings/rosterVisibility straight away,
// and the SubTeam pages pick the change up live.
export default function RosterSettingsBar() {
  const { t, localize } = useLanguage();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const { settings, loading, error } = useRosterSettings(true);
  const { busyId, errorKey, run } = useAdminAction();
  const disabled = loading || Boolean(error) || busyId !== null;

  const visibleCount = subteams.filter((team) => settings.showRoster[team.id]).length;
  const save = (changes) => run('roster', () => saveRosterSettings({ ...settings, ...changes }));

  return (
    <div className="glass mb-6 overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3.5 p-4 text-start transition-colors hover:bg-white/5 sm:px-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-edge bg-electric/15 text-logo-blue">
          <SlidersHorizontal className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{t('admin.roster.title')}</span>
          {!loading && !error && (
            <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4 text-logo-blue" />
                {t('admin.roster.visibleCount')}{' '}
                <span dir="ltr">
                  {visibleCount}/{subteams.length}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Contact className="size-4 text-logo-blue" />
                {t(settings.showMemberDetails ? 'admin.roster.detailsOn' : 'admin.roster.detailsOff')}
              </span>
            </span>
          )}
        </span>
        <ChevronDown className={`size-5 shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-edge p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-muted">{t('admin.roster.hint')}</p>
              <ActionAlert errorKey={errorKey ?? (error ? 'permission' : null)} />

              <fieldset disabled={disabled} className="mt-5 min-w-0 disabled:opacity-70">
                <legend className="text-sm font-bold">{t('admin.roster.rostersLabel')}</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subteams.map((team) => (
                    <SettingSwitch
                      key={team.id}
                      accent={team.accent}
                      checked={settings.showRoster[team.id]}
                      disabled={disabled}
                      onChange={(event) => save({ showRoster: { ...settings.showRoster, [team.id]: event.target.checked } })}
                    >
                      <span className="block font-bold [overflow-wrap:anywhere]">
                        {team.emoji} {localize(team.name)}
                      </span>
                    </SettingSwitch>
                  ))}
                </div>

                <div className="mt-5 border-t border-edge pt-5">
                  <SettingSwitch
                    checked={settings.showMemberDetails}
                    disabled={disabled}
                    onChange={(event) => save({ showMemberDetails: event.target.checked })}
                  >
                    <span className="block font-bold">{t('admin.roster.details')}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted">{t('admin.roster.detailsHint')}</span>
                  </SettingSwitch>
                </div>
              </fieldset>

              <p className="mt-4 text-xs text-muted">{t('admin.roster.autosave')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
