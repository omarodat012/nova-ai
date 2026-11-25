// Nova's brain: the AI model answers when it is configured and reachable; the local keyword
// replies below take over when the key is missing or the request fails, so the chat never breaks.
import { subteams as defaultSubteams } from '../../data/subteams.js';
import { generateNovaReply, isGeminiConfigured } from '../../services/geminiService.js';

const PHONE = '\u2066+962 7 7682 9501\u2069';
const HANDLE = '\u2066@nov3_ai\u2069';

const WELCOME_MESSAGE = {
  ar: 'هلا والله! أنا نوڤا 🎀 المساعدة الذكية لفريق NOVA AI.\nاسألني عن الفريق، الأفرقة، الفاوندر، أو كيف تنضم إلنا. شو حابب تعرف؟',
  en: "Hey there! I'm Nova 🎀 NOVA AI's resident robot.\nAsk me about the team, our sub-teams, our founder, or how to join. What would you like to know?",
};

const SUPERVISOR_WELCOME = {
  ar: 'أهلاً دكتورة إيناس! نورتي موقع نوڤا 🎀✨\nشرف كبير إلنا وجودك معنا كمشرفة لفريق NOVA AI. كيف بقدر أساعدك اليوم؟',
  en: "Welcome Dr. Enas! It's an honour to have you here 🎀✨\nThank you for guiding NOVA AI as our Faculty Supervisor. How can I help you today?",
};

// How Nova addresses the supervisor in her local replies.
const SUPERVISOR_ADDRESS = { ar: 'دكتورة إيناس', en: 'Dr. Enas' };

function getFirstName(member) {
  return member?.fullName?.trim().split(/\s+/)[0] ?? '';
}

// Nova's opening bubble: members (`member` is useAuth().memberProfile) are greeted by their first name,
// and the Faculty Supervisor (`roleTier` is useAuth().roleTier) by her title.
export function getWelcomeMessage(member, roleTier = null) {
  if (roleTier === 'supervisor') return SUPERVISOR_WELCOME;
  const name = getFirstName(member);
  if (!name) return WELCOME_MESSAGE;
  return {
    ar: `أهلاً يا ${name}! نورت موقع نوڤا 🎀✨\nكيف بقدر أساعدك اليوم؟`,
    en: `Hey ${name}! Welcome back to NOVA AI 🎀✨\nHow can I help you today?`,
  };
}

export const QUICK_REPLIES = [
  { ar: 'شو هو فريق نوڤا؟', en: 'What is NOVA AI?' },
  { ar: 'كيف أنضم؟', en: 'How do I join?' },
  { ar: 'مين الفاوندر؟', en: "Who's the founder?" },
  { ar: 'أحكيلي عن الأفرقة', en: 'Tell me about the sub-teams' },
];

// Checked in order, so more specific intents come first. Arabic keywords are pre-normalized.
// `memberReply(name)` replaces `reply` when a verified member is chatting.
const INTENTS = [
  {
    keywords: ['مين انت', 'من انت', 'اسمك', 'روبوت', 'who are you', 'your name', 'robot'],
    reply: {
      ar: 'أنا نوڤا، روبوتة فريق NOVA AI وصاحبة أحلى فيونكة وردية بالمجرّة 🎀',
      en: "I'm Nova, NOVA AI's robot and proud owner of the cutest pink bow in the galaxy 🎀",
    },
  },
  {
    // Before the founder intent, so "who supervises the team leader?" is answered about the supervisor.
    keywords: [
      'مشرف',
      'ايناس',
      'خشاشنه',
      'دكتور',
      'supervisor',
      'supervisors',
      'supervises',
      'advisor',
      'faculty',
      'dr enas',
      'enas',
      'khashashneh',
      'doctor',
    ],
    reply: {
      ar: 'مشرفة فريق NOVA AI هي الدكتورة إيناس خشاشنة، المشرفة الأكاديمية الرسمية للفريق في جامعة اليرموك، وهي اللي بتوجّهنا وبتدعمنا 🎀 أما المؤسِّسة وقائدة الفريق فهي الطالبة شهلا الزواهرة. وإذا حابب توصل للدكتورة، تواصل مع الفريق على واتساب أو إنستغرام.',
      en: "NOVA AI's Faculty Supervisor is Dr. Enas Khashashneh, the team's official supervisor at Yarmouk University, who guides and supports us 🎀 The Founder and Team Leader is a different person: our student Shahla Al-Zawahreh. To reach Dr. Enas, contact the team on WhatsApp or Instagram.",
    },
    // Replaces `reply` when the supervisor herself is the one asking.
    supervisorReply: {
      ar: 'إنتِ مشرفتنا يا دكتورة إيناس! 🎀 المشرفة الأكاديمية الرسمية لفريق NOVA AI في جامعة اليرموك، وشكراً على دعمك وتوجيهك إلنا. والمؤسِّسة وقائدة الفريق هي الطالبة شهلا الزواهرة.',
      en: "That's you, Dr. Enas! 🎀 You are NOVA AI's official Faculty Supervisor at Yarmouk University, and we are grateful for your guidance. Our Founder and Team Leader is our student Shahla Al-Zawahreh.",
    },
  },
  {
    keywords: ['شهلا', 'فاوندر', 'مؤسس', 'قائد', 'founder', 'founded', 'leader', 'shahla'],
    reply: {
      ar: 'فاوندرنا الفخم هي شهلا الزواهرة، مؤسِّسة وقائدة فريق NOVA AI وطالبة علم بيانات وذكاء اصطناعي. نظّمت وشاركت بهاكاثونات كثيرة لدرجة إننا فقدنا القدرة على عدّها! اكبس زر "عن فاوندرنا الفخم ✨" بأول الصفحة لتعرف أكثر. ومشرفة الفريق الأكاديمية هي الدكتورة إيناس خشاشنة.',
      en: 'Our amazing Founder and Team Leader is Shahla Al-Zawahreh, a Data Science and AI student. She has organised and joined so many hackathons that we lost count! Tap "About Our Amazing Founder ✨" at the top of the page to learn more. Our Faculty Supervisor is Dr. Enas Khashashneh.',
    },
  },
  {
    keywords: ['انضم', 'انضمام', 'اشترك', 'اسجل', 'تسجيل', 'join', 'apply', 'sign up', 'member'],
    reply: {
      ar: 'يا هلا بالعضو الجديد! ادخل على صفحة الانضمام /join وعبّي النموذج، أو ادخل صفحة أي فريق فرعي وقدّم طلبك من هناك مباشرة.',
      en: 'Love the energy! Head to the Join page at /join and fill in the application form, or open any SubTeam page and apply right there.',
    },
    memberReply: {
      ar: (name) => `يا ${name}، إنت أصلاً واحد من عيلة NOVA AI ✨ بتقدر تشوف بياناتك وتعدّلها من /profile، وإذا في حدا من صحابك حابب ينضم ابعتله /join.`,
      en: (name) => `${name}, you're already part of the NOVA AI family ✨ You can view and edit your details at /profile, and if a friend wants in, send them to /join.`,
    },
  },
  {
    keywords: ['الفرق', 'افرقه', 'فرعي', 'اقسام', 'subteam', 'sub-team', 'teams', 'departments'],
    reply: {
      ar: 'عنا 5 فرق فرعية: المشاريع والمسابقات 🧠، العمليات والتنظيم ⚙️، الإعلام والمحتوى 🎨، الشراكات والرعايات 🤝، والتعليم والمجتمع 🎓.',
      en: 'We have 5 sub-teams: Projects & Competitions 🧠, Operations & Organization ⚙️, Media & Content 🎨, Partnerships & Sponsorships 🤝, and Education & Community 🎓.',
    },
    // Added to the reply while at least one SubTeam has no leader; `names` lists those teams.
    openTeamsNote: {
      ar: (names) => `وعلى فكرة، ${names.join(' و')} لسا مفتوح للقيادة... يعني ممكن تكون إنت القائد!`,
      en: (names) =>
        `By the way, ${names.join(' and ')} ${names.length > 1 ? 'are' : 'is'} still open for leadership... it could be you!`,
    },
  },
  {
    keywords: ['تواصل', 'واتس', 'انستا', 'رقم', 'contact', 'whatsapp', 'instagram', 'phone', 'reach'],
    reply: {
      ar: `أسهل طريقة: واتساب على الرقم ${PHONE}، أو تابعنا على إنستغرام ${HANDLE}. الأزرار موجودة بقسم "تواصل معنا" تحت.`,
      en: `Easiest way: WhatsApp us on ${PHONE}, or follow us on Instagram ${HANDLE}. You will find both buttons in the Contact section below.`,
    },
  },
  {
    keywords: ['شو هو', 'ما هو', 'عن الفريق', 'مين انتو', 'nova ai', 'what is', 'about'],
    reply: {
      ar: 'NOVA AI فريق طلابي للذكاء الاصطناعي والتقنية في جامعة اليرموك، بإشراف الدكتورة إيناس خشاشنة وقيادة مؤسِّسته شهلا الزواهرة. بنتعلّم سوا، بنبني مشاريع حقيقية، وبنشارك بالهاكاثونات والمسابقات.',
      en: 'NOVA AI is a student team for AI and tech at Yarmouk University, supervised by Dr. Enas Khashashneh and led by its founder Shahla Al-Zawahreh. We learn together, build real projects, and take on hackathons and competitions.',
    },
  },
  {
    keywords: ['شكرا', 'يسلمو', 'يعطيك العافيه', 'thanks', 'thank you', 'thx'],
    reply: {
      ar: 'العفو! هذا شغلي... وما باخذ عليه راتب حتى.',
      en: "You're welcome! It's my job... and I don't even get paid for it.",
    },
    memberReply: {
      ar: (name) => `العفو يا ${name}! إحنا فريق واحد... حتى لو أنا الوحيدة اللي ما بتاخذ راتب.`,
      en: (name) => `Anytime, ${name}! We're teammates... even if I'm the only one who doesn't get paid.`,
    },
  },
  {
    keywords: ['مرحبا', 'السلام', 'اهلا', 'هلا', 'هاي', 'hi', 'hello', 'hey'],
    reply: {
      ar: 'أهلين وسهلين، نوّرت! اسألني عن الفريق، الفرق الفرعية، أو كيف تنضم إلنا.',
      en: 'Hello hello! Ask me about the team, the sub-teams, or how to join.',
    },
    memberReply: {
      ar: (name) => `أهلين يا ${name}، نوّرت! 🎀 شو بقدر أساعدك اليوم؟`,
      en: (name) => `Hey ${name}, great to see a teammate! 🎀 What can I help you with today?`,
    },
  },
];

const FALLBACKS = [
  {
    ar: 'سؤال حلو! بس عقلي الكامل مش متصل هسا. جرّب تسألني عن الفرق الفرعية، الانضمام، أو طرق التواصل.',
    en: "Great question! My full brain is offline right now. Try asking me about the sub-teams, joining, or how to reach us.",
  },
  {
    ar: 'هممم، دوائري الكهربائية ما التقطت هاي. ممكن تسألني عن NOVA AI، الفرق الفرعية، أو كيف تنضم؟',
    en: "Hmm, my circuits didn't catch that one. Could you ask me about NOVA AI, the sub-teams, or how to join?",
  },
];

let fallbackCursor = 0;

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ڤ/g, 'ف');
}

function matches(text, keyword) {
  // Latin keywords must match whole words so "hi" does not fire inside "this".
  if (/^[a-z ]+$/.test(keyword)) return new RegExp(`\\b${keyword}\\b`).test(text);
  return text.includes(keyword);
}

function getLocalReply(message, subteams, member, roleTier) {
  const text = normalize(message);
  const intent = INTENTS.find(({ keywords }) => keywords.some((keyword) => matches(text, keyword)));
  const lang = /[\u0600-\u06FF]/.test(message) ? 'ar' : 'en';
  const isSupervisor = roleTier === 'supervisor';
  const name = isSupervisor ? SUPERVISOR_ADDRESS[lang] : getFirstName(member);

  if (intent) {
    if (isSupervisor && intent.supervisorReply) return intent.supervisorReply[lang];
    // The teammate jokes are written for students, so the supervisor gets the standard replies.
    if (name && intent.memberReply && !isSupervisor) return intent.memberReply[lang](name);
    const openTeams = subteams.filter((team) => team.leaders.length === 0).map((team) => team.name[lang]);
    if (!intent.openTeamsNote || openTeams.length === 0) return intent.reply[lang];
    return `${intent.reply[lang]}\n${intent.openTeamsNote[lang](openTeams)}`;
  }
  fallbackCursor += 1;
  const fallback = FALLBACKS[fallbackCursor % FALLBACKS.length][lang];
  if (!name) return fallback;
  return lang === 'ar' ? `يا ${name}، ${fallback}` : `${name}, ${fallback.charAt(0).toLowerCase()}${fallback.slice(1)}`;
}

// history: [{ role: 'user' | 'bot', text: string }], ending with the user's latest message.
// `subteams` are the SubTeams with their live leaders (useSubteams()).
// `member` (the chatting member's document, or null), `user` and `roleTier` come from useAuth().
export async function getNovaReply(
  history,
  { signal, subteams = defaultSubteams, member = null, user = null, roleTier = null } = {},
) {
  if (isGeminiConfigured) {
    try {
      return await generateNovaReply(history, { signal, subteams, member, user, roleTier });
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn(`[NOVA AI] AI request failed (${error.message}). Nova is using her local replies instead.`);
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 650 + Math.random() * 650));
  }
  return getLocalReply(history[history.length - 1].text, subteams, member, roleTier);
}
