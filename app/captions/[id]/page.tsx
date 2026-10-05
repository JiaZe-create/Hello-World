import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { FIELDS } from '@/lib/captions';
import { UUID, type Caption } from '@/lib/caption-shared';
import CaptionCard from '@/app/components/caption-card';
export default async function CaptionPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!UUID.test(id))notFound();
 const db=await createClient();const user=await getUser();
 const {data,error}=await db.from('generations').select(FIELDS).eq('id',id).eq('status','complete').maybeSingle();
 if(error)throw new Error('Could not load this caption.');if(!data)notFound();
 const ballot=user?await db.from('caption_votes').select('value').eq('user_id',user.id).eq('generation_id',id).maybeSingle():null;
 return <main className="page-shell caption-detail"><Link className="small-link" href="/">← Back to the feed</Link><p className="eyebrow mt-10">ONE SCENE. ONE PUNCHLINE.</p><CaptionCard caption={data as Caption} signedIn={!!user} vote={ballot?.data?.value??0}/><Link className="button mt-8" href="/lab">Make your own ↗</Link></main>;
}
