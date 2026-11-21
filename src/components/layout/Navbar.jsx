import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Languages, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { NAV_SECTIONS, sectionPath } from '../../data/navigation.js';
import { useActiveSection } from '../../hooks/useActiveSection.js';
import { Logo } from '../ui/Brand.jsx';
import UserMenu, { UserMenuItems } from './UserMenu.jsx';

export default function Navbar({ onOpenAuth }) {
  const { t, toggleLanguage } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { pathname } = useLocation();
  const activeSection = useActiveSection(NAV_SECTIONS, pathname === '/');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Hidden while the saved session is being restored, so a signed-in visitor never sees a flash of "Login".
  const showLogin = !user && !authLoading;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const openAuth = () => {
    closeMenu();
    onOpenAuth();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 backdrop-blur-md transition-all duration-300 sm:px-5 ${
          scrolled || menuOpen
            ? 'border-edge bg-surface/75 shadow-[0_14px_44px_-18px_rgba(0,0,0,0.85)]'
            : 'border-white/5 bg-surface/30'
        }`}
      >
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
          <Logo className="size-10" />
          <span dir="ltr" className="font-display text-lg font-extrabold tracking-wide">
            NOVA <span className="text-gradient">AI</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_SECTIONS.map((id) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <Link
                  to={sectionPath(id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full border border-edge bg-electric/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{t(`nav.${id}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('nav.switchAria')}
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-edge bg-space/50 px-3.5 text-sm font-bold text-white transition hover:border-electric hover:bg-electric/10"
          >
            <Languages className="size-4 text-logo-blue transition-transform duration-500 group-hover:rotate-180" />
            <span>{t('nav.switchLabel')}</span>
          </button>

          <button
            type="button"
            onClick={openAuth}
            className={`btn btn-primary btn-sm hidden ${showLogin ? 'sm:inline-flex' : ''}`}
          >
            <LogIn className="size-4 rtl:-scale-x-100" />
            {t('nav.login')}
          </button>
          {user && <UserMenu />}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label={t(menuOpen ? 'nav.closeMenu' : 'nav.openMenu')}
            className="grid size-10 place-items-center rounded-full border border-edge bg-space/50 text-white transition hover:border-electric lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="glass-strong mx-auto mt-2 max-w-7xl rounded-2xl p-3 lg:hidden"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <ul className="flex flex-col gap-1">
              {NAV_SECTIONS.map((id, index) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  <Link
                    to={sectionPath(id)}
                    onClick={closeMenu}
                    className={`block rounded-xl px-4 py-3 font-medium transition-colors ${
                      activeSection === id ? 'bg-electric/15 text-white' : 'text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {t(`nav.${id}`)}
                  </Link>
                </motion.li>
              ))}
            </ul>
            {user && (
              <div className="mt-3 rounded-2xl border border-edge bg-space/40 p-1 sm:hidden">
                <UserMenuItems onNavigate={closeMenu} />
              </div>
            )}
            {showLogin && (
              <button type="button" onClick={openAuth} className="btn btn-primary mt-3 w-full sm:hidden">
                <LogIn className="size-4 rtl:-scale-x-100" />
                {t('nav.login')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
