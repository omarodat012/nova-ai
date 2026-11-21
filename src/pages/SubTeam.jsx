import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MembershipForm from '../components/MembershipForm.jsx';
import TeamHero from '../components/subteams/TeamHero.jsx';
import TeamLeadership from '../components/subteams/TeamLeadership.jsx';
import TeamResponsibilities from '../components/subteams/TeamResponsibilities.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSubteams } from '../context/SubteamsContext.jsx';
import NotFound from './NotFound.jsx';

export default function SubTeam() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getSubteam } = useSubteams();
  const team = getSubteam(id);

  if (!team) return <NotFound />;

  return (
    <div className="relative pb-24 pt-32" style={{ '--accent': team.accent }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,var(--accent),transparent)] opacity-15"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-white"
        >
          <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
          {t('common.backHome')}
        </Link>

        <TeamHero team={team} />

        <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <TeamResponsibilities team={team} />
          </div>
          <TeamLeadership team={team} />
        </div>

        <section id="apply" className="mt-20 scroll-mt-28">
          <SectionHeading
            eyebrow={t('subteamPage.applyEyebrow')}
            title={t('subteamPage.applyTitle')}
            subtitle={t('subteamPage.applyText')}
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <MembershipForm defaultSubteam={team.id} />
          </div>
        </section>
      </div>
    </div>
  );
}
