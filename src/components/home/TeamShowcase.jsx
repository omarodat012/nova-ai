import { useEffect, useRef, useState } from 'react';
import { animate, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSubteams } from '../../context/SubteamsContext.jsx';
import { isFirebaseConfigured } from '../../firebase/config.js';
import { fetchPublicMembers } from '../../services/publicMembersService.js';
import Reveal from '../ui/Reveal.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import SmartImage from '../ui/SmartImage.jsx';

const EASE = [0.22, 1, 0.36, 1];
// Auto-scroll speed, in pixels per second.
const SPEED = 40;
// Matches the `gap-5` / `pe-5` spacing between cards.
const GAP = 20;

function byTierThenName(a, b) {
  const tier = Number(b.roleTier === 'leader') - Number(a.roleTier === 'leader');
  return tier || a.name.localeCompare(b.name);
}

// The public cards from Firestore, leaders first. Empty while loading, without Firebase keys, or if the read fails,
// and an empty list hides the whole section.
function usePublicMembers() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let active = true;

    fetchPublicMembers()
      .then((items) => {
        if (!active) return;
        setPeople(
          items
            .filter((item) => typeof item.name === 'string' && item.name.trim() && item.roleTier !== 'supervisor')
            .sort(byTierThenName),
        );
      })
      .catch((error) => console.warn('[NOVA AI] Could not load the public team list.', error));

    return () => {
      active = false;
    };
  }, []);

  return people;
}

// A zero-width non-joiner keeps two Arabic initials from fusing into one ligature.
function toInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join('\u200C');
}

function PortraitPlaceholder({ name }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(165deg,#221c4d,#120f29_55%,#0b0a1a)]">
      <span className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_50%_36%,black,transparent_72%)]" />
      <div className="absolute inset-x-0 top-0 grid h-[76%] place-items-center">
        <span className="col-start-1 row-start-1 size-36 rounded-full bg-electric/30 blur-3xl" />
        <span className="col-start-1 row-start-1 size-32 animate-spin-slow rounded-[2rem] border border-logo-blue/40 shadow-[0_0_30px_-8px_rgba(79,140,255,0.9)]" />
        <span className="col-start-1 row-start-1 size-24 rotate-45 rounded-3xl border border-neon/50 bg-space/50" />
        <span className="col-start-1 row-start-1 font-display text-4xl font-extrabold text-white [text-shadow:0_0_26px_rgba(79,140,255,0.95)]">
          {toInitials(name)}
        </span>
      </div>
    </div>
  );
}

function TeamCard({ person }) {
  const { t, localize } = useLanguage();
  const { getSubteam } = useSubteams();
  const isLeader = person.roleTier === 'leader';
  const team = getSubteam(person.subteam);
  const tierKey = isLeader ? 'leader' : 'member';
  const roleLine = team ? t(`team.${tierKey}Of`).replace('{team}', localize(team.name)) : t(`team.${tierKey}`);
  const placeholder = <PortraitPlaceholder name={person.name} />;

  return (
    <article
      className={`group relative aspect-[3/4] w-52 shrink-0 overflow-hidden rounded-3xl border bg-surface transition duration-300 hover:-translate-y-1.5 sm:w-60 ${
        isLeader
          ? 'border-cyan-300/35 hover:border-cyan-300/70 hover:shadow-[0_28px_70px_-30px_rgba(34,211,238,0.85)]'
          : 'border-edge hover:border-logo-blue/60 hover:shadow-[0_28px_70px_-34px_rgba(79,140,255,0.9)]'
      }`}
    >
      {person.photoURL ? (
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <SmartImage
            key={person.photoURL}
            src={person.photoURL}
            alt=""
            draggable={false}
            fallback={placeholder}
            className="h-full w-full object-cover object-top"
          />
        </div>
      ) : (
        placeholder
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-space via-space/85 to-transparent px-4 pb-4 pt-16">
        <h3 className="font-bold leading-snug text-white [overflow-wrap:anywhere]">{person.name}</h3>
        <p
          className={`mt-1 flex items-start gap-1.5 text-xs font-medium leading-relaxed ${
            isLeader ? 'text-cyan-200 [text-shadow:0_0_14px_rgba(34,211,238,0.55)]' : 'text-logo-blue'
          }`}
        >
          {isLeader && <Crown aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />}
          {roleLine}
        </p>
      </div>
    </article>
  );
}

function ArrowButton({ side, label, onClick }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`glass-strong absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white transition-colors hover:border-logo-blue/80 hover:shadow-[0_0_26px_-6px_rgba(79,140,255,0.95)] sm:size-12 ${
        side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      }`}
    >
      <Icon className="size-5" />
    </motion.button>
  );
}

// The moving row. `offset` is how far the row has travelled toward its start edge; the cards are repeated often
// enough to fill the viewport, so wrapping it at one group's width makes the loop seamless in both directions.
// When every card already fits, the row is simply centered: no copies, no motion, no arrows.
function TeamStrip({ people }) {
  const { t, isRTL } = useLanguage();
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef(null);
  const groupRef = useRef(null);
  const [sizes, setSizes] = useState({ viewport: 0, group: 0 });
  const inView = useInView(viewportRef);
  const hovered = useRef(false);
  const drag = useRef(null);
  const glide = useRef(null);
  const offset = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const next = { viewport: viewportRef.current.clientWidth, group: groupRef.current.offsetWidth };
      setSizes((current) => (current.viewport === next.viewport && current.group === next.group ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportRef.current);
    observer.observe(groupRef.current);
    return () => observer.disconnect();
  }, []);

  const loops = sizes.group > 0 && sizes.group > sizes.viewport - GAP;
  const copies = loops ? Math.ceil(sizes.viewport / sizes.group) + 1 : 1;

  const x = useTransform(offset, (value) => {
    if (!loops) return 0;
    const wrapped = ((value % sizes.group) + sizes.group) % sizes.group;
    return isRTL ? wrapped : -wrapped;
  });

  useAnimationFrame((_, delta) => {
    if (!loops || reducedMotion || !inView || hovered.current || drag.current || glide.current) return;
    offset.set((offset.get() + (SPEED * Math.min(delta, 64)) / 1000) % sizes.group);
  });

  const stopGlide = () => {
    glide.current?.controls.stop();
    glide.current = null;
  };

  // One card forward (1) or back (-1). Quick repeated clicks add up instead of restarting from the current spot.
  const nudge = (direction) => {
    const to = (glide.current?.to ?? offset.get()) + (direction * sizes.group) / people.length;
    stopGlide();
    const controls = animate(offset, to, {
      duration: 0.6,
      ease: EASE,
      onComplete: () => {
        glide.current = null;
      },
    });
    glide.current = { to, controls };
  };

  const startDrag = (event) => {
    if (!loops || (event.pointerType === 'mouse' && event.button !== 0)) return;
    stopGlide();
    drag.current = { pointerX: event.clientX, offset: offset.get() };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!drag.current) return;
    const distance = event.clientX - drag.current.pointerX;
    offset.set(drag.current.offset + (isRTL ? distance : -distance));
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div className="relative mx-auto mt-10 max-w-[110rem]">
      <div
        ref={viewportRef}
        onPointerEnter={() => {
          hovered.current = true;
        }}
        onPointerLeave={() => {
          hovered.current = false;
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`touch-pan-y select-none overflow-hidden py-6 ${
          loops
            ? 'cursor-grab active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]'
            : ''
        }`}
      >
        <motion.div style={{ x }} className={`flex w-max ${loops ? '' : 'mx-auto ps-5'}`}>
          {Array.from({ length: copies }, (_, copy) => (
            <div
              key={copy}
              ref={copy === 0 ? groupRef : undefined}
              aria-hidden={copy > 0 ? 'true' : undefined}
              className="flex shrink-0 gap-5 pe-5"
            >
              {people.map((person) => (
                <TeamCard key={person.id} person={person} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {loops && (
        <>
          <ArrowButton
            side="left"
            label={t(isRTL ? 'team.next' : 'team.previous')}
            onClick={() => nudge(isRTL ? 1 : -1)}
          />
          <ArrowButton
            side="right"
            label={t(isRTL ? 'team.previous' : 'team.next')}
            onClick={() => nudge(isRTL ? -1 : 1)}
          />
        </>
      )}
    </div>
  );
}

export default function TeamShowcase() {
  const { t } = useLanguage();
  const people = usePublicMembers();

  if (people.length === 0) return null;

  return (
    <section id="team" aria-label={t('team.title')} className="relative scroll-mt-24 overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading eyebrow={t('team.eyebrow')} title={t('team.title')} />
      </div>
      <Reveal>
        <TeamStrip people={people} />
      </Reveal>
    </section>
  );
}
