'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { STYLES, UUID, dailyPrompt, type CaptionStyle } from '@/lib/caption-shared';
import { aiConfig, captionPrompt, generateCaption } from '@/lib/ai/captions';

export async function createCaption(form: FormData): Promise<{ id?: string; error?: string }> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Please sign in to create a caption.' };
  const { data: profile } = await db.from('profiles').select('first_name,last_name').eq('id',user.id).single();
  if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) return { error: 'Add your first and last name in Profile before creating a caption.' };
  const scene = String(form.get('scene') ?? '').trim();
  const style = String(form.get('style') ?? '');
  const id = String(form.get('request_id') ?? '');
  const remix = String(form.get('remix_of') ?? '');
  if (!UUID.test(id) || scene.length < 10 || scene.length > 500 || !STYLES.includes(style as CaptionStyle) || (remix && !UUID.test(remix))) return { error: 'Describe your scene in 10–500 characters and choose a tone.' };
  const existing = await db.from('generations').select('id,status').eq('id',id).eq('user_id',user.id).maybeSingle();
  if (existing.error) return { error: 'Could not reach your saved captions. Please try again.' };
  if (existing.data) return existing.data.status === 'complete' ? { id } : { error: 'This request was already received. Check My captions before trying again.' };
  const config = aiConfig();
  if (!config) return { error: 'The caption generator is not connected yet. Please try again later.' };
  const prompt = captionPrompt(scene, style as CaptionStyle);
  const daily = dailyPrompt();
  const { error: insertError } = await db.from('generations').insert({ id, user_id:user.id, scene, prompt, style, model:config.name, daily_key:scene===daily.scene ? daily.key : null, remix_of:remix || null });
  if (insertError) {
    if (insertError.code === 'P0001') return { error: insertError.message };
    return { error: 'Could not start this caption. Please check My captions, then try again.' };
  }
  let result;
  try { result = await generateCaption(prompt, config); }
  catch {
    await db.from('generations').update({status:'failed'}).eq('id',id).eq('user_id',user.id);
    return { error:'The AI service could not finish this caption. Your prompt is saved under Recent unfinished requests below. Please try again shortly.' };
  }
  const complete = result.caption.length > 0 && result.caption.length <= 400;
  // Persist the exact output, including an invalid response, for the owner.
  const { data: saved, error } = await db.from('generations').update({ ...result, status: complete ? 'complete' : 'failed' }).eq('id',id).eq('user_id',user.id).select('id').single();
  if (error || !saved) return { error: 'The caption could not be saved. Check My captions before retrying.' };
  revalidatePath('/'); revalidatePath('/lab');
  if (!complete) return { error: 'The AI returned an unusable caption. Your prompt is saved; try a clearer scene.' };
  return { id };
}

export async function rateCaption(id: string, value: number): Promise<{ error?: string; vote?: number; upvotes?: number; downvotes?: number }> {
  if (!UUID.test(id) || ![-1,0,1].includes(value)) return { error: 'Invalid vote.' };
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error:'Please sign in to vote.' };
  if (value === 0) {
    const { error } = await db.from('caption_votes').delete().eq('user_id',user.id).eq('generation_id',id);
    if (error) return { error:'Could not withdraw your vote. Try again.' };
  } else {
    const { error } = await db.from('caption_votes').insert({user_id:user.id,generation_id:id,value});
    if (error?.code === '23505') {
      const { error: updateError } = await db.from('caption_votes').update({value}).eq('user_id',user.id).eq('generation_id',id).select('id').single();
      if (updateError) return { error:'Could not change your vote. Try again.' };
    } else if (error) return { error:'Could not save your vote. Refresh and try again.' };
  }
  const { data, error } = await db.from('generations').select('upvotes,downvotes').eq('id',id).single();
  if (error) return { error:'Your vote was sent, but the totals could not refresh. Reload to check.' };
  revalidatePath('/'); revalidatePath(`/captions/${id}`);
  return { vote:value, ...data };
}
