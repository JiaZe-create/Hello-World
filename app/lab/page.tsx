import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser, getProfile, isComplete } from '@/lib/auth';
import { dailyPrompt, UUID } from '@/lib/caption-shared';
import { createClient } from '@/lib/supabase/server';
import { aiConfig } from '@/lib/ai/captions';
import Generator from '../components/generator';
export const maxDuration=60;
export default async function Lab({searchParams}:{searchParams:Promise<{remix?:string}>}) {
 const user=await requireUser(); if(!isComplete(await getProfile(user.id)))redirect('/profile');
 const {remix}=await searchParams;const db=await createClient();
 const source=remix&&UUID.test(remix)?await db.from('generations').select('id,scene').eq('id',remix).eq('status','complete').maybeSingle():null;
 const {data:drafts}=await db.from('generations').select('id,scene,status,prompt').eq('user_id',user.id).neq('status','complete').order('created_at',{ascending:false}).limit(5);
 return <main className="page-shell lab-shell"><Link className="small-link" href="/">← Back to the feed</Link><p className="eyebrow mt-10">THE COMEDY LAB</p><h1 className="page-title">Your life. A little funnier.</h1><p className="lab-intro">Give AI a scene from your day. Find the energy. Publish the punchline.</p>
 {source?.data&&<p className="remix-note">Remixing a community scene. Try a different tone.</p>}
 <Generator dailyScene={dailyPrompt().scene} initialScene={source?.data?.scene} remixOf={source?.data?.id} connected={!!aiConfig()}/>
 <div className="lab-bottom"><Link href="/?filter=mine" className="small-link">My published captions →</Link><p className="tiny">A good prompt gives a specific situation, not “write something funny.”</p></div>
 {!!drafts?.length&&<details className="drafts"><summary>Recent unfinished requests ({drafts.length})</summary>{drafts.map(d=><details key={d.id} className="prompt-details"><summary>{d.status==='failed'?'Couldn’t finish':'Pending / interrupted'}: {d.scene}</summary><pre>{d.prompt}</pre></details>)}<p className="tiny">If a request stays pending for more than a minute, submit a new generation. Saved prompts remain private until completed.</p></details>}
 </main>;
}
