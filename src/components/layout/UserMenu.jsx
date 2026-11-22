import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, MessageSquareHeart, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Avatar from '../ui/Avatar.jsx';

function getDisplayName(user) {
  return user.displayName?.trim() || user.email?.split('@')[0] || '';
}

// A member's own profile photo wins over the picture that came with their Google account.
function UserAvatar({ className }) {
  const { user, memberProfile } = useAuth();
  return <Avatar photoURL={memberProfile?.photoURL || user.photoURL} name={getDisplayName(user)} className={className} />;
}

// Shared by the desktop dropdown and the mobile menu panel.
export function UserMenuItems({ onNavigate }) {
  const { t } = useLanguage();
  const { user, isAdmin, memberProfile, logOut } = useAuth();
  const itemClass =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-bold transition-colors hover:bg-white/5';

  const handleLogout = async () => {
    onNavigate();
    try {
      await logOut();
    } catch (error) {
      console.error('[NOVA AI] Could not sign out.', error);
    }
  };

  // The panel can outlive the session by one exit animation after logging out.
  if (!user) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <UserAvatar className="size-10 text-base" />
        <div className="min-w-0">
          <p className="truncate font-bold">{getDisplayName(user)}</p>
          <p dir="ltr" className="truncate text-sm text-muted rtl:text-right">
            {user.email}
          </p>
        </div>
      </div>
      {memberProfile && (
        <p className="mx-3 mb-2.5 mt-1 flex w-fit animate-glow items-center rounded-full border border-bow/50 bg-[linear-gradient(135deg,rgba(244,114,182,0.2),rgba(124,58,237,0.28))] px-3 py-1 text-xs font-bold">
          {t('nav.memberBadge')}
        </p>
      )}
      <div className="my-1 h-px bg-edge" />
      <Link to="/profile" role="menuitem" onClick={onNavigate} className={`${itemClass} text-white`}>
        <UserRound className="size-4 text-logo-blue" />
        {t('nav.profile')}
      </Link>
      <Link to="/feedback" role="menuitem" onClick={onNavigate} className={`${itemClass} text-white`}>
        <MessageSquareHeart className="size-4 text-logo-blue" />
        {t('nav.feedback')}
      </Link>
      {isAdmin && (
        <Link to="/admin" role="menuitem" onClick={onNavigate} className={`${itemClass} text-white`}>
          <LayoutDashboard className="size-4 text-logo-blue" />
          {t('nav.dashboard')}
        </Link>
      )}
      <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} text-bow`}>
        <LogOut className="size-4 rtl:-scale-x-100" />
        {t('nav.logout')}
      </button>
    </>
  );
}

export default function UserMenu() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-edge bg-space/50 ps-1 pe-3 text-sm font-bold text-white transition hover:border-electric hover:bg-electric/10"
      >
        <UserAvatar />
        <span className="max-w-28 truncate">{getDisplayName(user).split(' ')[0]}</span>
        <ChevronDown className={`size-4 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className="glass-strong absolute end-0 top-full z-10 mt-3 w-72 rounded-2xl p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <UserMenuItems onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
