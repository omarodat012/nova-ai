import { useId } from 'react';
import SmartImage from './SmartImage.jsx';

export function NovaMark({ className = '' }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6E8CEF" />
          <stop offset="1" stopColor="#8C7AA9" />
        </linearGradient>
      </defs>
      <ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="8.5"
        transform="rotate(-28 24 24)"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.4"
        opacity="0.55"
      />
      <path
        d="M24 5c1.4 10.1 7.9 17 19 19-11.1 2-17.6 8.9-19 19-1.4-10.1-7.9-17-19-19 11.1-2 17.6-8.9 19-19Z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="39.5" cy="11" r="2.4" fill="#4F8CFF" />
    </svg>
  );
}

export function Logo({ className = 'size-10' }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`}>
      <SmartImage
        src="/assets/nova-logo.png"
        alt="NOVA AI"
        className="size-full object-contain"
        fallback={<NovaMark className="size-full drop-shadow-[0_0_12px_rgba(110,140,239,0.55)]" />}
      />
    </span>
  );
}

function NovaBotArt({ className = '' }) {
  const id = useId();
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B2A7A" />
          <stop offset="1" stopColor="#16132B" />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#C9CEF5" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill={`url(#${id}-bg)`} />
      <rect x="13" y="45" width="8" height="15" rx="4" fill="#6E8CEF" />
      <rect x="75" y="45" width="8" height="15" rx="4" fill="#6E8CEF" />
      <rect x="19" y="29" width="58" height="47" rx="20" fill={`url(#${id}-head)`} />
      <rect x="26" y="40" width="44" height="21" rx="10.5" fill="#16132B" />
      <path d="M35 53q4.5-6 9 0" fill="none" stroke="#6EC8FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 53q4.5-6 9 0" fill="none" stroke="#6EC8FF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="67" r="3.2" fill="#F472B6" opacity="0.75" />
      <circle cx="66" cy="67" r="3.2" fill="#F472B6" opacity="0.75" />
      <path d="M43.5 67q4.5 3.5 9 0" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
      <g transform="rotate(16 62 27)">
        <path d="M62 27 47 18.5c-2.6 5.4-2.6 11.6 0 17Z" fill="#F472B6" />
        <path d="M62 27l15-8.5c2.6 5.4 2.6 11.6 0 17Z" fill="#F472B6" />
        <path d="M62 27 50 24.5M62 27l12-2.5" stroke="#DB2777" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="62" cy="27" r="4.2" fill="#EC4899" />
      </g>
    </svg>
  );
}

export function NovaAvatar({ className = 'size-12' }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-surface ${className}`}>
      <SmartImage
        src="/assets/nova-bot.png"
        alt=""
        className="size-full object-cover"
        fallback={<NovaBotArt className="size-full" />}
      />
    </span>
  );
}
