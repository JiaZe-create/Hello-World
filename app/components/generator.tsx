'use client';
import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCaption } from '../caption-actions';
import { STYLES, type CaptionStyle } from '@/lib/caption-shared';
export default function Generator({dailyScene,initialScene='',remixOf='',connected}:{dailyScene:string;initialScene?:string;remixOf?:string;connected:boolean}) {
 const [scene,setScene]=useState(initialScene || dailyScene);
 const [style,setStyle]=useState<CaptionStyle>('dry');
 const [error,setError]=useState('');
 const [pending,startTransition]=useTransition();
 const requestId=useRef('');
 const router=useRouter();
 function submit(form:FormData) {startTransition(async()=>{
   setError('');requestId.current ||= crypto.randomUUID();
   form.set('request_id',requestId.current);form.set('style',style);form.set('remix_of',remixOf);
   try {const result=await createCaption(form);if(result.error){setError(result.error);requestId.current='';return;}router.push(`/captions/${result.id}`);router.refresh();}
   catch {setError('Connection lost. Check My captions before retrying; your request may still finish.');}
 });}
 return <form action={submit} className="generator">
  {!connected && <p className="connection-notice" role="status">AI generation is awaiting its API connection. You can still explore and rate published captions.</p>}
  <div className="generator-top"><label htmlFor="scene">Set the scene</label><button type="button" className="small-link" disabled={pending} onClick={()=>setScene(dailyScene)}>Use today’s prompt ↻</button></div>
  <textarea id="scene" name="scene" minLength={10} maxLength={500} required value={scene} onChange={e=>{setScene(e.target.value);requestId.current='';}} disabled={pending} rows={5} aria-describedby="scene-help" />
  <div id="scene-help" className="input-help"><span>A real-life moment, minus anyone’s private details.</span><span>{scene.length}/500</span></div>
  <fieldset disabled={pending}><legend>Choose the energy</legend><div className="tone-options">{STYLES.map(s=><label className={style===s?'active':''} key={s}><input type="radio" name="tone" value={s} checked={style===s} onChange={()=>{setStyle(s);requestId.current='';}}/>{s}</label>)}</div></fieldset>
  <button disabled={pending||!connected} className="button generate-button">{pending?'Finding the punchline…':'Generate & publish'} <span aria-hidden="true">✦</span></button>
  <p className="tiny">Your scene and AI caption will be public. Up to 10 generations per 24 hours.</p>
  {pending && <p className="pending-note" role="status">Usually a few seconds. Your prompt is saved before generation begins.</p>}
  {error && <p className="form-error" role="alert">{error}</p>}
 </form>;
}
