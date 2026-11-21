import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { achievements as placeholders } from '../../data/achievements.js';
import { isFirebaseConfigured } from '../../firebase/config.js';
import { fetchAchievements } from '../../services/achievementsService.js';
import { formatDate } from '../../utils/formatDate.js';
import AchievementCover, { COVER_CATEGORIES } from '../achievements/AchievementCover.jsx';
import Reveal from '../ui/Reveal.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';

// Cover, date and title only; the full description and the photo gallery live on /achievements/:id.
function AchievementCard({ item }) {
  const { t, lang, localize } = useLanguage();

  return (
    <Link
      to={`/achievements/${item.id}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1.5 hover:border-logo-blue/60 hover:shadow-[0_28px_70px_-34px_rgba(79,140,255,0.9)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <AchievementCover achievement={item} className="transition-transform duration-700 group-hover:scale-105" />
        {item.status === 'coming-soon' && (
          <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-space/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            <Clock className="size-3.5 text-bow" />
            {t('common.comingSoon')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex items-center gap-2 text-sm text-logo-blue">
          <CalendarDays className="size-4" />
          {formatDate(item.date, lang) || t('achievements.dateTba')}
        </span>
        <h3 className="mt-3 text-xl font-bold leading-snug [overflow-wrap:anywhere]">{localize(item.title)}</h3>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-logo-blue transition-colors group-hover:text-white">
          {t('common.readMore')}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// Live posts from Firestore (newest first). `null` means the request is still in flight.
// Without Firebase keys, or if the request fails, the section falls back to the placeholder cards.
function useLiveAchievements() {
  const [posts, setPosts] = useState(isFirebaseConfigured ? null : []);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let active = true;

    fetchAchievements()
      .then((items) => active && setPosts(items))
      .catch((error) => {
        console.warn('[NOVA AI] Could not load achievements from Firestore; showing the placeholders.', error);
        if (active) setPosts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return posts;
}

export default function Achievements() {
  const { t } = useLanguage();
  const posts = useLiveAchievements();
  const hasLivePosts = Boolean(posts?.length);
  const items = hasLivePosts ? posts : placeholders;

  return (
    <section id="achievements" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow={t('achievements.eyebrow')}
          title={t('achievements.title')}
          subtitle={t(hasLivePosts ? 'achievements.subtitleLive' : 'achievements.subtitle')}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy={posts === null}>
          {posts === null
            ? [0, 1, 2].map((slot) => (
                <div key={slot} aria-hidden="true" className="glass h-[22rem] animate-pulse rounded-3xl" />
              ))
            : items.map((item, index) => (
                <Reveal key={item.id} delay={(index % 3) * 0.08}>
                  <AchievementCard item={{ category: COVER_CATEGORIES[index % COVER_CATEGORIES.length], ...item }} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
