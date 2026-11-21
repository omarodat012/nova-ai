import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSubteams } from '../../context/SubteamsContext.jsx';
import { isGeminiConfigured } from '../../services/geminiService.js';
import { NovaAvatar } from '../ui/Brand.jsx';
import MessageText from './MessageText.jsx';
import { getNovaReply, getWelcomeMessage, QUICK_REPLIES } from './novaBrain.js';

const NOVA_GRADIENT = 'bg-[linear-gradient(135deg,#F472B6,#7C3AED)]';
const HEADER_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30';

function Bubble({ fromUser = false, children }) {
  return (
    <motion.div
      className={`flex items-end gap-2 ${fromUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!fromUser && <NovaAvatar className="size-7" />}
      <p
        className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
          fromUser ? 'bg-brand rounded-ee-md text-white' : 'rounded-es-md border border-edge bg-surface text-white/90'
        }`}
      >
        {/* The text follows its own language, so an English reply reads left-to-right inside the Arabic UI. */}
        <span dir="auto" className="block text-start">
          {children}
        </span>
      </p>
    </motion.div>
  );
}

function TypingIndicator({ label }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      role="status"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <NovaAvatar className="size-7" />
      <span className="flex items-center gap-2.5 rounded-2xl rounded-es-md border border-bow/30 bg-surface px-3.5 py-2.5 text-sm text-white/80">
        {label}
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="size-1.5 animate-typing rounded-full bg-bow" />
          <span className="size-1.5 animate-typing rounded-full bg-bow [animation-delay:0.15s]" />
          <span className="size-1.5 animate-typing rounded-full bg-bow [animation-delay:0.3s]" />
        </span>
      </span>
    </motion.div>
  );
}

export default function NovaChatbot() {
  const { t, localize } = useLanguage();
  const { subteams } = useSubteams();
  const { user, memberProfile } = useAuth();
  const [open, setOpen] = useState(false);
  // The conversation only; Nova's welcome bubble is rendered separately so it follows the UI language.
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [nudge, setNudge] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(1);
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  // Briefly surface the tooltip after load so visitors notice Nova.
  useEffect(() => {
    const show = setTimeout(() => setNudge(true), 2500);
    const hide = setTimeout(() => setNudge(false), 9500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const createMessage = (role, text) => {
    const id = nextId.current;
    nextId.current += 1;
    return { id, role, text };
  };

  const send = async (text) => {
    const content = text.trim();
    if (!content || typing) return;

    const history = [...messages, createMessage('user', content)];
    const request = new AbortController();
    requestRef.current = request;
    setMessages(history);
    setDraft('');
    setTyping(true);

    try {
      const reply = await getNovaReply(history, { signal: request.signal, subteams, member: memberProfile, user });
      if (!request.signal.aborted) setMessages((current) => [...current, createMessage('bot', reply)]);
    } catch {
      // Only an aborted request (cleared chat) rejects; there is nothing to show for it.
    } finally {
      if (!request.signal.aborted) setTyping(false);
    }
  };

  const clearChat = () => {
    requestRef.current?.abort();
    setMessages([]);
    setTyping(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(draft);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={t('chat.name')}
            className="glass-strong fixed bottom-24 end-4 z-40 flex h-[min(34rem,calc(100svh-11.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl shadow-[0_30px_90px_-20px_rgba(124,58,237,0.75)] sm:bottom-28 sm:end-6 sm:h-[min(34rem,calc(100svh-13rem))]"
            initial={{ opacity: 0, y: 28, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <header className="flex items-center gap-3 border-b border-edge bg-[linear-gradient(135deg,rgba(244,114,182,0.22),rgba(124,58,237,0.22))] px-4 py-3">
              <span className="relative">
                <NovaAvatar className="size-11 ring-2 ring-bow/70" />
                <span className="absolute bottom-0 end-0 size-3 rounded-full border-2 border-surface bg-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold leading-tight">{t('chat.name')}</p>
                <p className="text-xs text-muted">{t('chat.status')}</p>
              </div>
              <button
                type="button"
                onClick={clearChat}
                disabled={messages.length === 0}
                aria-label={t('chat.clear')}
                title={t('chat.clear')}
                className={HEADER_BUTTON}
              >
                <Trash2 className="size-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('chat.close')} className={HEADER_BUTTON}>
                <X className="size-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              <Bubble>{localize(getWelcomeMessage(memberProfile))}</Bubble>
              {messages.map((message) =>
                message.role === 'user' ? (
                  <Bubble key={message.id} fromUser>
                    {message.text}
                  </Bubble>
                ) : (
                  <Bubble key={message.id}>
                    <MessageText text={message.text} onNavigate={() => setOpen(false)} />
                  </Bubble>
                ),
              )}
              {typing && <TypingIndicator label={t('chat.typing')} />}
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.en}
                    type="button"
                    onClick={() => send(localize(reply))}
                    className="rounded-full border border-bow/40 bg-bow/10 px-3 py-1.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-bow/25"
                  >
                    {localize(reply)}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-edge p-3">
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t('chat.placeholder')}
                aria-label={t('chat.placeholder')}
                maxLength={500}
                className="field rounded-full py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label={t('chat.send')}
                className={`grid size-11 shrink-0 place-items-center rounded-full text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${NOVA_GRADIENT}`}
              >
                <Send className="size-4 rtl:-scale-x-100" />
              </button>
            </form>
            <p className="px-4 pb-3 text-center text-[0.7rem] text-muted/80">
              {t(isGeminiConfigured ? 'chat.disclaimer' : 'chat.disclaimerOffline')}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 end-4 z-40 sm:bottom-6 sm:end-6">
        <AnimatePresence>
          {!open && (nudge || hovered) && (
            <motion.span
              className="glass-strong pointer-events-none absolute bottom-full end-0 mb-3 whitespace-nowrap rounded-2xl rounded-ee-md px-4 py-2 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(244,114,182,0.8)]"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {t('chat.tooltip')}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((current) => !current)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-label={t(open ? 'chat.close' : 'chat.open')}
          aria-expanded={open}
          className="relative grid size-16 place-items-center rounded-full"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-bow/50" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-neon/50 [animation-delay:1.3s]" />
          <span className={`absolute inset-0 rounded-full shadow-[0_0_30px_-2px_rgba(244,114,182,0.8)] ${NOVA_GRADIENT}`} />
          <span className="relative grid size-14 place-items-center overflow-hidden rounded-full border-2 border-space/80">
            {open ? <X className="size-6 text-white" /> : <NovaAvatar className="size-full" />}
          </span>
        </motion.button>
      </div>
    </>
  );
}
