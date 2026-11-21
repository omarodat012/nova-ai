// Home page sections, in order. Ids double as DOM anchors and `nav.*` translation keys.
export const NAV_SECTIONS = ['home', 'about', 'subteams', 'achievements', 'contact'];

export function sectionPath(id) {
  return id === 'home' ? '/' : `/#${id}`;
}
