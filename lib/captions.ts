import 'server-only';
import { createClient } from './supabase/server';
import { dailyPrompt, type Caption } from './caption-shared';
export const FIELDS = 'id,scene,prompt,style,daily_key,caption,model,created_at,remix_of,upvotes,downvotes,score';
export async function getFeed(filter: string, page: number, userId?: string) {
  const db = await createClient();
  let query = db.from('generations').select(FIELDS).eq('status','complete');
  if (filter==='today') query=query.eq('daily_key',dailyPrompt().key);
  if (filter==='week') query=query.gte('created_at',new Date(Date.now()-7*86400000).toISOString()).order('score',{ascending:false});
  if (filter==='mine' && userId) query=query.eq('user_id',userId);
  query=query.order('created_at',{ascending:false}).order('id').range(page*12,page*12+12);
  const { data, error } = await query;
  if(error) throw new Error('Could not load the caption feed.');
  const captions=(data??[]) as Caption[];
  const more=captions.length>12; captions.splice(12);
  const votes: Record<string,number> = {};
  if(userId && captions.length) {
    const {data,error}=await db.from('caption_votes').select('generation_id,value').eq('user_id',userId).in('generation_id',captions.map(c=>c.id));
    if(error) throw new Error('Could not load your votes.');
    data?.forEach(v=>{votes[v.generation_id]=v.value;});
  }
  return {captions,votes,more};
}
