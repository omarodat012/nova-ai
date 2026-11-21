// Placeholder cards for the home page, shown until the Firestore `achievements` collection has posts.
// Same shape as those documents ({ title, description, date, image }) plus the `status` and `category` used by the cover.
// They open /achievements/<id> like live posts. `image: null` renders the styled cover; `date: null` renders the "date to be announced" label.
export const achievements = [
  {
    id: 'hackathons',
    status: 'coming-soon',
    category: 'hackathon',
    image: null,
    date: null,
    title: {
      ar: 'هاكاثونات ومسابقات',
      en: 'Hackathons & Competitions',
    },
    description: {
      ar: 'مشاركات فريق NOVA AI في الهاكاثونات والمسابقات التقنية ستظهر هنا قريباً.',
      en: "NOVA AI's hackathon and tech competition entries will be showcased here soon.",
    },
  },
  {
    id: 'workshops',
    status: 'coming-soon',
    category: 'workshop',
    image: null,
    date: null,
    title: {
      ar: 'ورش عمل وجلسات تدريبية',
      en: 'Workshops & Training Sessions',
    },
    description: {
      ar: 'تغطية ورش العمل والجلسات واللقاءات التي ننظّمها لمجتمعنا.',
      en: 'Coverage of the workshops, sessions, and talks we organise for our community.',
    },
  },
  {
    id: 'community',
    status: 'coming-soon',
    category: 'community',
    image: null,
    date: null,
    title: {
      ar: 'فعاليات ومجتمع',
      en: 'Events & Community',
    },
    description: {
      ar: 'لحظات من فعالياتنا ولقاءاتنا مع الأعضاء والشركاء.',
      en: 'Moments from our events and meetups with members and partners.',
    },
  },
];
