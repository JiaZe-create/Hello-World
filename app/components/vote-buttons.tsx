'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { rateCaption } from '../caption-actions';
export default function VoteButtons({id,initialVote,upvotes,downvotes,signedIn}:{id:string;initialVote:number;upvotes:number;downvotes:number;signedIn:boolean}) {
  const [vote,setVote]=useState(initialVote);
  const [counts,setCounts]=useState({upvotes,downvotes});
  const [error,setError]=useState('');
  const [pending,startTransition]=useTransition();
  function rate(next:number) { startTransition(async()=>{
    setError('');
    try { const r=await rateCaption(id,vote===next?0:next); if(r.error){setError(r.error);return;}
      setVote(r.vote!);setCounts({upvotes:r.upvotes!,downvotes:r.downvotes!});
    } catch {setError('Connection lost. Refresh to check whether your vote saved.');}
  }); }
  return <div><div className="vote-row">{signedIn ? <>
    <button disabled={pending} aria-pressed={vote===1} aria-label="Upvote: made me laugh" className={`vote-button ${vote===1?'selected':''}`} onClick={()=>rate(1)}>↑ <span>Funny</span> <b>{counts.upvotes}</b></button>
    <button disabled={pending} aria-pressed={vote===-1} aria-label="Downvote: needs work" className={`vote-button ${vote===-1?'selected':''}`} onClick={()=>rate(-1)}>↓ <span>Needs work</span> <b>{counts.downvotes}</b></button>
  </> : <><span className="public-score">↑ {counts.upvotes} <span className="muted">·</span> ↓ {counts.downvotes}</span><Link className="small-link" href="/login">Sign in to vote ↗</Link></>}</div>
  {pending && <span role="status" className="tiny">Saving vote…</span>}{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
