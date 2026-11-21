import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../../data/links.js';
import { subteams } from '../../data/subteams.js';

const { instagram, whatsapp } = SOCIAL_LINKS;
const PAGE_PATHS = [...subteams.map((team) => `/subteam/${team.id}`), '/join'];
const WHATSAPP_NUMBER = '\\+962 ?7 ?7682 ?9501';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Only these exact tokens become links, so a reply can never smuggle in an arbitrary URL.
const LINK_PATTERN = new RegExp(
  `(${[...PAGE_PATHS, instagram.url, whatsapp.url, instagram.handle].map(escapeRegExp).join('|')}|${WHATSAPP_NUMBER})`,
  'g',
);

const LINK_CLASS = 'whitespace-nowrap font-bold text-bow underline underline-offset-2 transition hover:text-white';

// Renders one of Nova's replies, turning the site's pages and contact details into links.
export default function MessageText({ text, onNavigate }) {
  return text.split(LINK_PATTERN).map((part, index) => {
    if (index % 2 === 0) return part;
    const key = `${index}-${part}`;

    if (PAGE_PATHS.includes(part)) {
      return (
        <Link key={key} to={part} onClick={onNavigate} dir="ltr" className={LINK_CLASS}>
          {part}
        </Link>
      );
    }

    const toInstagram = part === instagram.url || part === instagram.handle;
    return (
      <a
        key={key}
        href={toInstagram ? instagram.url : whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className={LINK_CLASS}
      >
        {toInstagram ? instagram.handle : whatsapp.display}
      </a>
    );
  });
}
