import { CalendarPlus, Lightbulb, MessageSquareText, Sparkles } from 'lucide-react';

// Kept in sync with the `category` list in firestore.rules.
export const feedbackCategories = [
  { id: 'suggestion', icon: Lightbulb, accent: '#4F8CFF', label: { ar: 'اقتراح', en: 'Suggestion' } },
  { id: 'opinion', icon: MessageSquareText, accent: '#F472B6', label: { ar: 'رأي أو ملاحظة', en: 'Feedback / Opinion' } },
  { id: 'event', icon: CalendarPlus, accent: '#FBBF24', label: { ar: 'فكرة فعالية أو ورشة', en: 'Idea for an Event / Workshop' } },
  { id: 'other', icon: Sparkles, accent: '#A78BFA', label: { ar: 'أخرى', en: 'Other' } },
];

export function getFeedbackCategory(id) {
  return feedbackCategories.find((category) => category.id === id) ?? feedbackCategories[feedbackCategories.length - 1];
}
