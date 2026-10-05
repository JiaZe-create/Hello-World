import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getFeed } from '@/lib/captions';
import { dailyPrompt } from '@/lib/caption-shared';
import CaptionCard from './components/caption-card';
export default async function Home({searchParams}:{searchParams:Promise<{filter?:string;page?:string}>}) {
 const params=await searchParams;
 const filter=['new','today','week','mine'].includes(params.filter??'')?params.filter!:'new';
 const page=Math.max(0,Math.min(100,Number.parseInt(params.page??'0')||0));
 const user=await getUser();
 if(filter==='mine'&&!user)redirect('/login');
 const {captions,votes,more}=await getFeed(filter,page,user?.id);
 const daily=dailyPrompt();
 return <main className="feed-shell">
  <section className="hero"><div className="hero-copy"><p className="eyebrow">COLUMBIA LIFE. NYC ENERGY. AI PUNCHLINES.</p><h1>A city full of stories.<br/><em>Make yours funny.</em></h1><p className="hero-description">Turn your everyday campus chaos into a caption.<br/>The AI writes it. You decide if it lands.</p><Link href="/lab" className="button hero-cta">Make a caption <span>↗</span></Link></div><div className="hero-stamp" aria-hidden="true"><div className="stamp-orbit">116 ST · NEW YORK ·</div><span>off<br/>campus<span className="star">✦</span></span><small>VERY ONLINE. VERY LOCAL.</small></div></section>
  <div className="feed-layout"><section aria-label="Caption feed"><div className="feed-heading"><h2>The feed<span className="live-dot"/></h2><span className="tiny">AI generated. Community rated.</span></div>
  <nav className="filter-tabs" aria-label="Filter captions">{[['new','Fresh'],['today','Today’s prompt'],['week','Top this week'],['mine','My captions']].map(([key,label])=><Link key={key} aria-current={filter===key?'page':undefined} className={filter===key?'active':''} href={`/?filter=${key}`}>{label}</Link>)}</nav>
  {captions.length ? <div className="caption-grid">{captions.map(c=><CaptionCard key={c.id} caption={c} vote={votes[c.id]} signedIn={!!user}/>)}</div> : <div className="empty-state"><span aria-hidden="true">✦</span><h3>{filter==='mine'?'Your best line is still ahead.':'The mic is open.'}</h3><p>{filter==='today'?'No captions for today’s prompt yet. Be the first to give it a twist.':'No captions here yet. Start with a scene and let AI find the punchline.'}</p><Link href="/lab" className="button">Create a caption ↗</Link></div>}
  <div className="pagination">{page>0&&<Link href={`/?filter=${filter}&page=${page-1}`}>← Newer</Link>}{more&&<Link href={`/?filter=${filter}&page=${page+1}`}>More captions →</Link>}</div></section>
  <aside><section className="daily-card"><div className="daily-meta"><span className="pill">DAILY PROMPT</span><span>NO. {String(daily.number).padStart(2,'0')}</span></div><div className="daily-doodle" aria-hidden="true">↳ ✳</div><h2>Same city.<br/>Different punchline.</h2><p>{daily.scene}</p><Link className="button" href="/lab">Take a shot ↗</Link><small>New prompt at midnight, New York time.</small></section><section className="how-card"><p className="eyebrow">HOW IT WORKS</p><ol><li><b>01</b><span>Bring a moment.<small>Dorm drama, subway lore, weekend plans.</small></span></li><li><b>02</b><span>Pick a tone.<small>Dry, chaotic, or unexpectedly wholesome.</small></span></li><li><b>03</b><span>Let the crowd decide.<small>Vote, remix, and share the good ones.</small></span></li></ol></section><p className="sidebar-note">Unofficial student project.<br/>Not affiliated with Columbia University.</p></aside></div>
 </main>;
}
