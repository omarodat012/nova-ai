import { motion } from 'framer-motion';
import { subteams } from '../../data/subteams.js';
import { Logo } from '../ui/Brand.jsx';

// Decorative: the logo at the core with the five SubTeams orbiting around it.
export default function HeroOrbit() {
  return (
    <motion.div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-[var(--orbit)]"
      style={{ '--orbit': 'min(72vw, 27rem)' }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 rounded-full border border-edge" />

      <div className="absolute inset-[14%] animate-orbit-reverse rounded-full border border-dashed border-logo-blue/30">
        <span className="absolute left-1/2 top-0 -ml-1 -mt-1 size-2 rounded-full bg-bow shadow-[0_0_12px_3px_rgba(244,114,182,0.8)]" />
        <span className="absolute bottom-0 left-1/2 -mb-1 -ml-1 size-2 rounded-full bg-electric shadow-[0_0_12px_3px_rgba(79,140,255,0.8)]" />
      </div>

      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.5),transparent_68%)]" />

      <div className="glass absolute inset-[28%] grid place-items-center rounded-full shadow-[0_0_80px_-10px_rgba(79,140,255,0.65)]">
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-electric/50" />
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-neon/50 [animation-delay:1.3s]" />
        <Logo className="size-[62%]" />
      </div>

      <div className="absolute inset-0 animate-orbit">
        {subteams.map((team, index) => {
          const angle = (360 / subteams.length) * index - 90;
          const Icon = team.icon;
          return (
            <div
              key={team.id}
              className="absolute left-1/2 top-1/2 -ml-7 -mt-7 size-14"
              style={{
                transform: `rotate(${angle}deg) translateX(calc(var(--orbit) / 2)) rotate(${-angle}deg)`,
              }}
            >
              <div
                className="glass grid size-full animate-orbit-reverse place-items-center rounded-2xl"
                style={{ color: team.accent, boxShadow: `0 0 26px -6px ${team.accent}` }}
              >
                <Icon className="size-6" strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
