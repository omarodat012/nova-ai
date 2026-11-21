import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import FounderModal from './FounderModal.jsx';
import HeroOrbit from './HeroOrbit.jsx';

// Deterministic pseudo-random star field so the layout is identical on every render.
const STARS = Array.from({ length: 44 }, (_, index) => {
  const random = (salt) => {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  return {
    top: `${random(1) * 100}%`,
    left: `${random(2) * 100}%`,
    size: 1 + random(3) * 2,
    delay: `${random(4) * 4}s`,
  };
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="bg-grid absolute inset-0" />
      <motion.div
        className="absolute -start-40 -top-40 size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.32),transparent_62%)]"
        animate={{ x: [0, 70, -30, 0], y: [0, 50, 90, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -end-48 top-10 size-[46rem] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.34),transparent_62%)]"
        animate={{ x: [0, -60, 40, 0], y: [0, 70, -20, 0], scale: [1, 0.92, 1.1, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-56 start-1/3 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.15),transparent_62%)]"
        animate={{ x: [0, 50, -50, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="absolute animate-twinkle rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const [founderOpen, setFounderOpen] = useState(false);

  return (
    <section id="home" className="relative isolate flex min-h-svh items-center overflow-hidden pb-20 pt-32">
      <HeroBackground />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-start">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-2 text-sm font-medium text-muted backdrop-blur-md"
          >
            <Sparkles className="size-4 shrink-0 text-electric" />
            {t('hero.badge')}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-extrabold leading-[1.35] sm:text-5xl sm:leading-[1.3] xl:text-6xl xl:leading-[1.25]"
          >
            {t('hero.titleLead')} <span className="text-gradient">{t('hero.titleAccent')}</span>
            <br className="hidden sm:block" /> {t('hero.titleTail')}
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-lg leading-loose text-muted lg:mx-0"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link to="/join" className="btn btn-primary w-full sm:w-auto">
              {t('hero.ctaJoin')}
              <ArrowRight className="size-5 rtl:-scale-x-100" />
            </Link>
            <button type="button" onClick={() => setFounderOpen(true)} className="btn btn-founder w-full sm:w-auto">
              {t('hero.ctaFounder')}
            </button>
          </motion.div>

          <motion.ul variants={item} className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3 lg:mx-0">
            {t('hero.pillars').map((pillar) => (
              <li key={pillar.label} className="glass rounded-2xl px-3 py-4 text-center">
                <span dir="ltr" className="text-gradient block font-display text-2xl font-extrabold sm:text-3xl">
                  {pillar.value}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted sm:text-sm">{pillar.label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <HeroOrbit />
      </div>

      <FounderModal open={founderOpen} onClose={() => setFounderOpen(false)} />
    </section>
  );
}
