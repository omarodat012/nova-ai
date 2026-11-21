import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock, LoaderCircle, ShieldAlert } from 'lucide-react';
import AchievementCover from '../components/achievements/AchievementCover.jsx';
import PhotoGallery from '../components/achievements/PhotoGallery.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { achievements as placeholders } from '../data/achievements.js';
import { fetchAchievement } from '../services/achievementsService.js';
import { getAchievementMedia } from '../utils/achievementMedia.js';
import { formatDate } from '../utils/formatDate.js';
import NotFound from './NotFound.jsx';

const EASE = [0.22, 1, 0.36, 1];

// Resolves /achievements/:id to { status: 'loading' | 'ready' | 'missing' | 'error', post }.
// The home page's placeholder cards resolve straight from data/achievements.js; live posts come from Firestore.
function useAchievement(id) {
  const placeholder = placeholders.find((item) => item.id === id);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (placeholder) return undefined;
    let active = true;

    fetchAchievement(id)
      .then((post) => active && setResult({ id, status: post ? 'ready' : 'missing', post }))
      .catch((error) => {
        console.warn('[NOVA AI] Could not load the achievement from Firestore.', error);
        if (active) setResult({ id, status: 'error', post: null });
      });

    return () => {
      active = false;
    };
  }, [id, placeholder]);

  if (placeholder) return { status: 'ready', post: placeholder };
  return result?.id === id ? result : { status: 'loading', post: null };
}

function BackLink() {
  const { t } = useLanguage();

  return (
    <Link
      to="/#achievements"
      className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-white"
    >
      <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
      {t('achievementPage.back')}
    </Link>
  );
}

export default function AchievementDetail() {
  const { id } = useParams();
  const { t, lang, localize } = useLanguage();
  const { status, post } = useAchievement(id);

  if (status === 'missing') return <NotFound />;
  if (status === 'loading') {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label={t('achievementPage.loading')}>
        <LoaderCircle className="size-9 animate-spin text-logo-blue" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <section className="flex min-h-svh items-center pb-20 pt-32">
        <div className="mx-auto max-w-xl px-5 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl border border-edge bg-white/5 text-bow">
            <ShieldAlert className="size-8" strokeWidth={1.5} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold">{t('achievementPage.errorTitle')}</h1>
          <p className="mb-8 mt-3 text-lg leading-loose text-muted">{t('achievementPage.errorText')}</p>
          <BackLink />
        </div>
      </section>
    );
  }

  const title = localize(post.title);
  const { photos } = getAchievementMedia(post);

  return (
    <article className="relative pb-24 pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(79,140,255,0.2),transparent)]"
      />

      <div className="relative mx-auto max-w-4xl px-5">
        <BackLink />

        <motion.header
          className="mt-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue backdrop-blur-md">
              <CalendarDays className="size-4" />
              {formatDate(post.date, lang) || t('achievements.dateTba')}
            </span>
            {post.status === 'coming-soon' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-bow/40 bg-bow/10 px-3.5 py-1.5 text-sm font-bold">
                <Clock className="size-4 text-bow" />
                {t('common.comingSoon')}
              </span>
            )}
          </div>
          <h1 className="mt-5 text-3xl font-extrabold leading-snug [overflow-wrap:anywhere] sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-snug">
            {title}
          </h1>
        </motion.header>

        <motion.div
          className="glass group mt-8 aspect-[16/9] overflow-hidden rounded-[2rem] shadow-[0_40px_100px_-50px_rgba(79,140,255,0.9)]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <AchievementCover achievement={post} alt={title} />
        </motion.div>

        <Reveal className="mt-10">
          <p className="whitespace-pre-line text-lg leading-loose text-muted [overflow-wrap:anywhere]">
            {localize(post.description)}
          </p>
        </Reveal>

        {photos.length > 0 && <PhotoGallery photos={photos} title={title} />}
      </div>
    </article>
  );
}
