export const STYLES = ['dry', 'chaotic', 'wholesome'] as const;
export type CaptionStyle = typeof STYLES[number];
export type Caption = {
  id: string; scene: string; prompt: string; style: CaptionStyle; daily_key: string | null;
  caption: string; model: string; created_at: string; remix_of: string | null;
  upvotes: number; downvotes: number; score: number;
};
export const DAILY_SCENES = [
  'You moved from the Midwest to NYC and just paid more for a salad than your hometown movie ticket.',
  'You dress for a quick trip to Butler Library and accidentally spend the entire weekend there.',
  'Your dorm group chat plans a big Saturday adventure and everyone ends up at the same bagel place.',
  'You confidently lead your friends to the subway, then realize you are on the wrong platform.',
  'Your parents ask if you have seen all of New York yet. You have mostly seen the laundry room.',
  'You try to explain a tiny NYC dorm room to a friend whose apartment has a spare bedroom.',
  'You go to Central Park to touch grass but spend the whole time finding the best photo angle.',
  'You promise yourself a cheap weekend in New York and immediately spot a pop-up market.',
  'A Columbia student brings three books to a cafe and reads only the menu.',
  'You discover a new neighborhood, get lost, and call it character development.',
  'Your hometown friends think you are living a glamorous NYC life. You are waiting for a dryer.',
  'You and your roommate agree to sleep early, then start debating the best pizza at midnight.',
  'You finally get a seat on the 1 train, exactly one stop before you need to get off.',
  'You pack for a weekend walk as if crossing Manhattan requires an expedition team.',
];
export function dailyPrompt(now = new Date()) {
  const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const index = Math.floor(Date.parse(`${key}T12:00:00Z`) / 86400000) % DAILY_SCENES.length;
  return { key, scene: DAILY_SCENES[index], number: index + 1 };
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
