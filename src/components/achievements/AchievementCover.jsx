import { Lightbulb, Trophy, Users } from 'lucide-react';
import { getAchievementMedia } from '../../utils/achievementMedia.js';
import SmartImage from '../ui/SmartImage.jsx';

const CATEGORY_STYLES = {
  hackathon: { icon: Trophy, accent: '#4F8CFF' },
  workshop: { icon: Lightbulb, accent: '#A78BFA' },
  community: { icon: Users, accent: '#F472B6' },
};
// Live posts have no category, so lists rotate their photo-less covers through the three styles.
export const COVER_CATEGORIES = Object.keys(CATEGORY_STYLES);

function StyledCover({ category }) {
  const { icon: Icon, accent } = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.hackathon;

  return (
    <div className="relative grid size-full place-items-center overflow-hidden bg-surface" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 22% 18%, ${accent}66, transparent 55%), radial-gradient(circle at 82% 92%, rgba(124, 58, 237, 0.45), transparent 55%)`,
        }}
      />
      <div className="bg-grid absolute inset-0" />
      <div className="relative grid size-20 place-items-center rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md transition duration-500 group-hover:rotate-3 group-hover:scale-110">
        <Icon className="size-9" style={{ color: accent }} strokeWidth={1.5} />
      </div>
    </div>
  );
}

// Fills its parent with the post's cover photo, or a styled cover when there is none (or the file is missing).
export default function AchievementCover({ achievement, alt = '', className = '' }) {
  const { cover } = getAchievementMedia(achievement);
  const styled = <StyledCover category={achievement.category} />;

  if (!cover) return styled;
  // Keyed by source so a changed cover starts loading from scratch.
  return <SmartImage key={cover} src={cover} alt={alt} className={`size-full object-cover ${className}`} fallback={styled} />;
}
