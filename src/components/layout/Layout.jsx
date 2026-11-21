import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AuthModal from '../auth/AuthModal.jsx';
import NovaChatbot from '../chatbot/NovaChatbot.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import ScrollManager from './ScrollManager.jsx';

export default function Layout() {
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = useCallback(() => setAuthOpen(true), []);

  return (
    <div className="relative overflow-x-clip">
      <ScrollManager />
      <Navbar onOpenAuth={openAuth} />
      <main>
        <Outlet context={{ openAuth }} />
      </main>
      <Footer />
      <NovaChatbot />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
