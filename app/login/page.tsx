import { redirect } from 'next/navigation';
import { getUser, getProfile, isComplete } from '@/lib/auth';
import { getSupabaseConfig } from '@/lib/supabase/config';
import LoginButton from './login-button';
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getUser();
  if (user) redirect(isComplete(await getProfile(user.id)) ? '/lab' : '/profile');
  const { url, key } = getSupabaseConfig();
  const { error } = await searchParams;
  return <main className="page-shell"><p className="eyebrow">Off Campus · Members</p><h1 className="page-title">A little more behind the laugh.</h1><p className="my-6 text-lg">Sign in to create AI captions, vote for your favorites, and remix a scene.</p>{error && <p role="alert" className="mb-5 text-red-600">We couldn’t complete sign-in. Please try again.</p>}<LoginButton url={url} apiKey={key} /></main>;
}
