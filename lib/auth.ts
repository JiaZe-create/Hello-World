import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}
export async function getProfile(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('first_name,last_name,avatar_path').eq('id', id).single();
  if (error) throw new Error('Unable to load your profile. Please try again.');
  return data;
}
export function isComplete(profile: { first_name: string | null; last_name: string | null }) {
  return Boolean(profile.first_name?.trim() && profile.last_name?.trim());
}
