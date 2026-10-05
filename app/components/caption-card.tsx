import Link from 'next/link';
import type { Caption } from '@/lib/caption-shared';
import VoteButtons from './vote-buttons';
import ShareButton from './share-button';
export default function CaptionCard({caption:c,vote=0,signedIn=false}:{caption:Caption;vote?:number;signedIn?:boolean}) {
 return <article className={`caption-card tone-${c.style}`}>
  <div className="card-meta"><span className="pill">{c.style}</span><span>AI GENERATED</span><span className="card-date">{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'America/New_York'}).format(new Date(c.created_at))}</span></div>
  <p className="scene-label">THE SCENE</p><p className="scene-text">{c.scene}</p>
  <Link href={`/captions/${c.id}`} className="caption-link"><h2 className="caption-text">{c.caption}</h2></Link>
  <VoteButtons key={`${c.id}-${vote}-${c.upvotes}-${c.downvotes}`} id={c.id} initialVote={vote} upvotes={c.upvotes} downvotes={c.downvotes} signedIn={signedIn}/>
  <div className="card-bottom"><Link className="small-link" href={`/lab?remix=${c.id}`}>Remix this ↻</Link><ShareButton id={c.id}/></div>
  <details className="prompt-details"><summary>Behind the caption</summary><p>Generated with {c.model}. Prompt and caption are public.</p><pre>{c.prompt}</pre>{c.remix_of && <Link href={`/captions/${c.remix_of}`}>View the original scene →</Link>}</details>
 </article>;
}
