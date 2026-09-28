import { requireUser, getProfile, isComplete } from '@/lib/auth';
import { getSupabaseConfig } from '@/lib/supabase/config';
import ProfileForm from './profile-form';
export default async function Profile() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const { url, key } = getSupabaseConfig();
  return <main className="page-shell"><p className="eyebrow">Your account</p><h1 className="page-title">Profile</h1><p className="my-5">{isComplete(profile) ? 'Update your name and profile photo.' : 'Welcome! Add your first and last name to enter the Comedy Lab.'}</p><ProfileForm userId={user.id} profile={profile} url={url} apiKey={key} /></main>;
}
