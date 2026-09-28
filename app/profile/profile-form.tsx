'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
type Profile = { first_name: string | null; last_name: string | null; avatar_path: string | null };
export default function ProfileForm({ userId, profile, url, apiKey }: { userId: string; profile: Profile; url: string; apiKey: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const supabase = createClient(url, apiKey);
  const photo = profile.avatar_path ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl : null;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setFailed(false);
    const form = event.currentTarget;
    const data = new FormData(form);
    const first_name = String(data.get('first_name') ?? '').trim();
    const last_name = String(data.get('last_name') ?? '').trim();
    let uploaded: string | null = null;
    try {
      if (!first_name || !last_name || first_name.length > 80 || last_name.length > 80) throw new Error('Enter both names, using at most 80 characters each.');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) { router.replace('/login'); return; }
      let avatar_path = profile.avatar_path;
      const file = data.get('photo');
      if (file instanceof File && file.size > 0) {
        const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const ext = extensions[file.type];
        if (!ext || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG, or WebP photo under 5 MB.');
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error('Photo upload failed. Please try again.');
        uploaded = path; avatar_path = path;
      }
      const { data: updated, error } = await supabase.from('profiles').update({ first_name, last_name, avatar_path }).eq('id', user.id).select('id').single();
      if (error || !updated) throw new Error('Could not save your profile. Please try again.');
      uploaded = null;
      if (profile.avatar_path && profile.avatar_path !== avatar_path) await supabase.storage.from('avatars').remove([profile.avatar_path]);
      const input = form.elements.namedItem('photo');
      if (input instanceof HTMLInputElement) input.value = '';
      setMessage('Profile saved. You can now enter the Comedy Lab.');
      router.refresh();
    } catch (error) {
      if (uploaded) await supabase.storage.from('avatars').remove([uploaded]);
      setFailed(true); setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-8 max-w-lg space-y-6">
    {photo && <Image src={photo} alt="Your profile photo" width={112} height={112} unoptimized className="h-28 w-28 rounded-full object-cover" />}
    <div><label htmlFor="first_name" className="block mb-2 font-medium">First name</label><input className="profile-input" id="first_name" name="first_name" autoComplete="given-name" required maxLength={80} defaultValue={profile.first_name ?? ''} /></div>
    <div><label htmlFor="last_name" className="block mb-2 font-medium">Last name</label><input className="profile-input" id="last_name" name="last_name" autoComplete="family-name" required maxLength={80} defaultValue={profile.last_name ?? ''} /></div>
    <div><label htmlFor="photo" className="block mb-2 font-medium">Profile photo (optional)</label><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" className="max-w-full" /><p id="photo-help" className="mt-2 text-sm text-zinc-500">JPG, PNG, or WebP. Maximum 5 MB. Uploaded photos are publicly viewable.</p></div>
    <button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    {message && <p role={failed ? 'alert' : 'status'}>{message}</p>}
    <Link className="block underline" href="/lab">Enter the Comedy Lab →</Link>
  </form>;
}
