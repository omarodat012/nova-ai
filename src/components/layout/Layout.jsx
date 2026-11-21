import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BadgeCheck, MailCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import AuthModal from '../auth/AuthModal.jsx';
import VerifyEmailBanner from '../auth/VerifyEmailBanner.jsx';
import NovaChatbot from '../chatbot/NovaChatbot.jsx';
import Toast from '../ui/Toast.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import ScrollManager from './ScrollManager.jsx';

export default function Layout() {
  const { t } = useLanguage();
  // `step` is where the modal opens: the log in / sign up form, or straight at "Verify your email".
  const [authModal, setAuthModal] = useState({ open: false, step: 'form' });
  // The welcome toast after a successful verification. `member` is kept while it animates out.
  const [welcome, setWelcome] = useState({ open: false, member: false });

  const openAuth = useCallback(() => setAuthModal({ open: true, step: 'form' }), []);
  const openVerifyEmail = useCallback(() => setAuthModal({ open: true, step: 'verify' }), []);
  const closeAuth = useCallback(() => setAuthModal((current) => ({ ...current, open: false })), []);
  const closeWelcome = useCallback(() => setWelcome((current) => ({ ...current, open: false })), []);

  const handleVerified = (member) => {
    closeAuth();
    setWelcome({ open: true, member: Boolean(member) });
  };

  return (
    <div className="relative overflow-x-clip">
      <ScrollManager />
      <Navbar onOpenAuth={openAuth} />
      <main>
        <Outlet context={{ openAuth, openVerifyEmail }} />
      </main>
      <Footer />
      <VerifyEmailBanner hidden={authModal.open} onVerify={openVerifyEmail} />
      <NovaChatbot />
      <AuthModal open={authModal.open} initialStep={authModal.step} onClose={closeAuth} onVerified={handleVerified} />
      <Toast
        open={welcome.open}
        onClose={closeWelcome}
        icon={welcome.member ? BadgeCheck : MailCheck}
        title={t('auth.toast.welcome')}
      >
        {t(welcome.member ? 'auth.toast.member' : 'auth.toast.verified')}
      </Toast>
    </div>
  );
}
