import { Brain, GraduationCap, Handshake, Palette, Settings2 } from 'lucide-react';

// The SubTeams and their default leaders. Components read them through useSubteams() (context/SubteamsContext.jsx),
// where a team's leaders can be replaced from the admin dashboard (Firestore `subteam_leaders/<team id>`).
// `logo` is loaded from public/assets; `icon` is the styled fallback until the image exists.
//
// Leader shape: { name: { ar, en }, photo, email, phone, major: { ar, en }, academicYear: { ar, en } }.
// Only `name` is required; leave any other field as '' (or remove it) and the site simply does not show it.
// `photo` is a path under public/ (e.g. /assets/leaders/omar-odat.jpg); initials are shown until the file exists.
// An empty `leaders` array renders the "open for leadership" badge.
export const subteams = [
  {
    id: 'projects',
    emoji: '🧠',
    icon: Brain,
    accent: '#4F8CFF',
    logo: '/assets/subteams/projects.jpeg',
    name: {
      ar: 'فريق المشاريع والمسابقات',
      en: 'Projects & Competitions Team',
    },
    leaders: [
      {
        name: { ar: 'عمر عودات', en: 'Omar Odat' },
        photo: '/assets/leaders/omar-odat.jpg',
        email: '',
        phone: '',
        major: { ar: '', en: '' },
        academicYear: { ar: '', en: '' },
      },
    ],
    description: {
      ar: 'تحويل أفكار Nova AI لمشاريع ومشاركات فعلية، تطوير المشاريع التقنية، المشاركة في Hackathons & Competitions، البحث عن التحديات والفرص وتشكيل فرق العمل، متابعة تنفيذ المشاريع من الفكرة حتى الإنجاز.',
      en: "Turns Nova AI's ideas into real projects and participations: developing technical projects, taking part in hackathons and competitions, scouting challenges and opportunities, forming teams, and following every project from idea to delivery.",
    },
    highlights: {
      ar: [
        'تحويل الأفكار إلى مشاريع ومشاركات فعلية',
        'تطوير المشاريع التقنية',
        'المشاركة في Hackathons & Competitions',
        'البحث عن التحديات والفرص وتشكيل فرق العمل',
        'متابعة التنفيذ من الفكرة حتى الإنجاز',
      ],
      en: [
        'Turning ideas into real projects and participations',
        'Developing technical projects',
        'Competing in hackathons and competitions',
        'Scouting challenges and opportunities and forming teams',
        'Following projects from idea to delivery',
      ],
    },
  },
  {
    id: 'operations',
    emoji: '⚙️',
    icon: Settings2,
    accent: '#8B5CF6',
    logo: '/assets/subteams/operations.jpeg',
    name: {
      ar: 'فريق العمليات والتنظيم',
      en: 'Operations & Organization Team',
    },
    leaders: [
      {
        name: { ar: 'شهلا الزواهرة', en: 'Shahla Al-Zawahreh' },
        photo: '/assets/leaders/shahla-al-zawahreh.jpg',
        email: '',
        phone: '',
        major: { ar: '', en: '' },
        academicYear: { ar: '', en: '' },
      },
    ],
    description: {
      ar: 'مسؤول عن تنظيم وإدارة العمل الداخلي في Nova AI وضمان سير الفريق بطريقة واضحة ومنظمة. يتولى الفريق إدارة الأعضاء، توزيع المهام، متابعة الـ Deadlines، تنظيم الاجتماعات والملفات، وتطوير أنظمة العمل والـ Onboarding للأعضاء الجدد.',
      en: "Responsible for organising and managing Nova AI's internal work and keeping the team running in a clear, structured way. The team handles member management, task distribution, deadline tracking, meetings and files, and develops the work systems and onboarding for new members.",
    },
    highlights: {
      ar: [
        'إدارة الأعضاء وتوزيع المهام',
        'متابعة الـ Deadlines',
        'تنظيم الاجتماعات والملفات',
        'تطوير أنظمة العمل',
        'الـ Onboarding للأعضاء الجدد',
      ],
      en: [
        'Member management and task distribution',
        'Deadline tracking',
        'Organising meetings and files',
        'Developing work systems',
        'Onboarding new members',
      ],
    },
  },
  {
    id: 'media',
    emoji: '🎨',
    icon: Palette,
    accent: '#F472B6',
    logo: '/assets/subteams/media.jpeg',
    name: {
      ar: 'فريق الإعلام والمحتوى',
      en: 'Media & Content Team',
    },
    leaders: [
      {
        name: { ar: 'نور عبابنة', en: 'Noor Ababneh' },
        photo: '/assets/leaders/noor-ababneh.jpg',
        email: '',
        phone: '',
        major: { ar: '', en: '' },
        academicYear: { ar: '', en: '' },
      },
    ],
    description: {
      ar: 'مسؤول عن الهوية الإعلامية والبصرية لـ Nova AI، إيصال أنشطتها وأفكارها للجمهور، صناعة المحتوى، التصميم، التصوير والمونتاج، إدارة منصات التواصل الاجتماعي، وتغطية الفعاليات، والحفاظ على Brand Identity موحدة واحترافية.',
      en: "Responsible for Nova AI's media and visual identity and for bringing its activities and ideas to the audience: content creation, design, photography and video editing, social media management, and event coverage, all while keeping a unified, professional brand identity.",
    },
    highlights: {
      ar: [
        'الهوية الإعلامية والبصرية',
        'صناعة المحتوى والتصميم',
        'التصوير والمونتاج',
        'إدارة منصات التواصل الاجتماعي',
        'تغطية الفعاليات والحفاظ على Brand Identity',
      ],
      en: [
        'Media and visual identity',
        'Content creation and design',
        'Photography and video editing',
        'Social media management',
        'Event coverage and a consistent brand identity',
      ],
    },
  },
  {
    id: 'partnerships',
    emoji: '🤝',
    icon: Handshake,
    accent: '#5EC8F2',
    logo: '/assets/subteams/partnerships.jpeg',
    name: {
      ar: 'فريق الشراكات والرعايات',
      en: 'Partnerships & Sponsorships Team',
    },
    leaders: [
      {
        name: { ar: 'عبادة الزعبي', en: 'Obada Al-Zoubi' },
        photo: '/assets/leaders/obada-al-zoubi.jpg',
        email: '',
        phone: '',
        major: { ar: '', en: '' },
        academicYear: { ar: '', en: '' },
      },
      {
        name: { ar: 'يزن كنعان', en: 'Yazan Kanaan' },
        photo: '/assets/leaders/yazan-kanaan.jpg',
        email: '',
        phone: '',
        major: { ar: '', en: '' },
        academicYear: { ar: '', en: '' },
      },
    ],
    description: {
      ar: 'بناء وتطوير العلاقات مع الشركات، المؤسسات، الجامعات، والمجتمعات المختلفة، إيجاد فرص Partnerships & Sponsorships، التواصل مع الجهات الخارجية وإعداد عروض التعاون، إدارة العلاقة مع الشركاء من أول تواصل وحتى انتهاء التعاون.',
      en: 'Builds and grows relationships with companies, institutions, universities, and communities: finding partnership and sponsorship opportunities, reaching out to external parties and preparing collaboration proposals, and managing partner relationships from first contact to the end of the collaboration.',
    },
    highlights: {
      ar: [
        'بناء العلاقات مع الشركات والمؤسسات والجامعات',
        'إيجاد فرص Partnerships & Sponsorships',
        'التواصل مع الجهات الخارجية',
        'إعداد عروض التعاون',
        'إدارة العلاقة مع الشركاء من البداية للنهاية',
      ],
      en: [
        'Building relationships with companies, institutions, and universities',
        'Finding partnership and sponsorship opportunities',
        'Reaching out to external parties',
        'Preparing collaboration proposals',
        'Managing partner relationships end to end',
      ],
    },
  },
  {
    id: 'education',
    emoji: '🎓',
    icon: GraduationCap,
    accent: '#A78BFA',
    logo: '/assets/subteams/education.jpeg',
    name: {
      ar: 'فريق التعليم والمجتمع',
      en: 'Education & Community Team',
    },
    leaders: [],
    description: {
      ar: 'مسؤول عن الجانب التعليمي والمجتمعي في Nova AI، وتحويل الفريق إلى بيئة للتعلم والتطور. يعمل على تنظيم Workshops, Training Sessions & Talks، توفير فرص التعلم والتوجيه، بناء مجتمع نشط من المهتمين بالـ AI، ومساعدة الأعضاء على تطوير مهاراتهم التقنية والشخصية.',
      en: "Responsible for Nova AI's educational and community side, turning the team into an environment for learning and growth. It organises workshops, training sessions and talks, provides learning and mentoring opportunities, builds an active community of AI enthusiasts, and helps members develop their technical and personal skills.",
    },
    highlights: {
      ar: [
        'تنظيم Workshops, Training Sessions & Talks',
        'توفير فرص التعلم والتوجيه',
        'بناء مجتمع نشط من المهتمين بالـ AI',
        'تطوير مهارات الأعضاء التقنية والشخصية',
      ],
      en: [
        'Organising workshops, training sessions and talks',
        'Providing learning and mentoring opportunities',
        'Building an active community of AI enthusiasts',
        "Developing members' technical and personal skills",
      ],
    },
  },
];

export function getSubteamById(id) {
  return subteams.find((team) => team.id === id);
}
