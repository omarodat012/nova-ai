// Nova's brain: Gemini answers when it is configured and reachable; the local keyword
// replies below take over when the key is missing or the request fails, so the chat never breaks.
import { subteams as defaultSubteams } from '../../data/subteams.js';
import { generateNovaReply, isGeminiConfigured } from '../../services/geminiService.js';

const PHONE = '\u2066+962 7 7682 9501\u2069';
const HANDLE = '\u2066@nov3_ai\u2069';

export const WELCOME_MESSAGE = {
  ar: 'هلا والله! أنا نوڤا 🎀 المساعدة الذكية لفريق NOVA AI.\nاسألني عن الفريق، الأفرقة، الفاوندر، أو كيف تنضم إلنا. شو حابب تعرف؟',
  en: "Hey there! I'm Nova 🎀 NOVA AI's resident robot.\nAsk me about the team, our sub-teams, our founder, or how to join. What would you like to know?",
};

export const QUICK_REPLIES = [
  { ar: 'شو هو فريق نوڤا؟', en: 'What is NOVA AI?' },
  { ar: 'كيف أنضم؟', en: 'How do I join?' },
  { ar: 'مين الفاوندر؟', en: "Who's the founder?" },
  { ar: 'أحكيلي عن الأفرقة', en: 'Tell me about the sub-teams' },
];

// Checked in order, so more specific intents come first. Arabic keywords are pre-normalized.
const INTENTS = [
  {
    keywords: ['مين انت', 'من انت', 'اسمك', 'روبوت', 'who are you', 'your name', 'robot'],
    reply: {
      ar: 'أنا نوڤا، روبوتة فريق NOVA AI وصاحبة أحلى فيونكة وردية بالمجرّة 🎀',
      en: "I'm Nova, NOVA AI's robot and proud owner of the cutest pink bow in the galaxy 🎀",
    },
  },
  {
    keywords: ['شهلا', 'فاوندر', 'مؤسس', 'قائد', 'founder', 'founded', 'leader', 'shahla'],
    reply: {
      ar: 'فاوندرنا الفخم هي شهلا الزواهرة، طالبة علم بيانات وذكاء اصطناعي وقائدة فريق NOVA AI. نظّمت وشاركت بهاكاثونات كثيرة لدرجة إننا فقدنا القدرة على عدّها! اكبس زر "عن فاوندرنا الفخم ✨" بأول الصفحة لتعرف أكثر.',
      en: 'Our amazing founder is Shahla Al-Zawahreh, a Data Science and AI student who leads NOVA AI. She has organised and joined so many hackathons that we lost count! Tap "About Our Amazing Founder ✨" at the top of the page to learn more.',
    },
  },
  {
    keywords: ['انضم', 'انضمام', 'اشترك', 'اسجل', 'تسجيل', 'join', 'apply', 'sign up', 'member'],
    reply: {
      ar: 'يا هلا بالعضو الجديد! ادخل على صفحة الانضمام /join وعبّي النموذج، أو ادخل صفحة أي فريق فرعي وقدّم طلبك من هناك مباشرة.',
      en: 'Love the energy! Head to the Join page at /join and fill in the application form, or open any SubTeam page and apply right there.',
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
      ar: 'NOVA AI فريق طلابي جامعي للذكاء الاصطناعي والتقنية. بنتعلّم سوا، بنبني مشاريع حقيقية، وبنشارك بالهاكاثونات والمسابقات.',
      en: 'NOVA AI is a university student team for AI and tech. We learn together, build real projects, and take on hackathons and competitions.',
    },
  },
  {
    keywords: ['شكرا', 'يسلمو', 'يعطيك العافيه', 'thanks', 'thank you', 'thx'],
    reply: {
      ar: 'العفو! هذا شغلي... وما باخذ عليه راتب حتى.',
      en: "You're welcome! It's my job... and I don't even get paid for it.",
    },
  },
  {
    keywords: ['مرحبا', 'السلام', 'اهلا', 'هلا', 'هاي', 'hi', 'hello', 'hey'],
    reply: {
      ar: 'أهلين وسهلين، نوّرت! اسألني عن الفريق، الفرق الفرعية، أو كيف تنضم إلنا.',
      en: 'Hello hello! Ask me about the team, the sub-teams, or how to join.',
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

function getLocalReply(message, subteams) {
  const text = normalize(message);
  const intent = INTENTS.find(({ keywords }) => keywords.some((keyword) => matches(text, keyword)));
  const lang = /[\u0600-\u06FF]/.test(message) ? 'ar' : 'en';

  if (intent) {
    const openTeams = subteams.filter((team) => team.leaders.length === 0).map((team) => team.name[lang]);
    if (!intent.openTeamsNote || openTeams.length === 0) return intent.reply[lang];
    return `${intent.reply[lang]}\n${intent.openTeamsNote[lang](openTeams)}`;
  }
  fallbackCursor += 1;
  return FALLBACKS[fallbackCursor % FALLBACKS.length][lang];
}

// history: [{ role: 'user' | 'bot', text: string }], ending with the user's latest message.
// `subteams` are the SubTeams with their live leaders (useSubteams()).
export async function getNovaReply(history, { signal, subteams = defaultSubteams } = {}) {
  if (isGeminiConfigured) {
    try {
      return await generateNovaReply(history, { signal, subteams });
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn(`[NOVA AI] Gemini request failed (${error.message}). Nova is using her local replies instead.`);
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 650 + Math.random() * 650));
  }
  return getLocalReply(history[history.length - 1].text, subteams);
}
