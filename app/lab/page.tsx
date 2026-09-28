import { redirect } from 'next/navigation';
import { requireUser, getProfile, isComplete } from '@/lib/auth';
export default async function Lab() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!isComplete(profile)) redirect('/profile');
  return <main className="page-shell"><p className="eyebrow">Members only</p><h1 className="page-title">Comedy Lab</h1><p className="mt-5 text-lg">Welcome, {profile.first_name}. Let’s take a joke apart.</p><article className="mt-10 rounded-2xl border border-zinc-300 p-8"><h2 className="text-xl font-semibold">Today’s exercise: the unexpected turn</h2><blockquote className="my-6 border-l-4 border-indigo-500 pl-5 text-xl">I started a support group for procrastinators. Our first meeting is next week. Probably.</blockquote><p className="leading-7">The setup promises an organized solution. The final word undermines that promise by repeating the very behavior the group is supposed to fix.</p><p className="mt-5 leading-7">Try it: write a serious setup, then add a final sentence that changes what the audience expects. How late can you place the surprise?</p></article></main>;
}
