'use client';
import { useState } from 'react';
export default function ShareButton({id,caption}:{id:string;caption:string}) {
 const [message,setMessage]=useState('');
 async function copy(kind:'caption'|'link') {
  try {
   await navigator.clipboard.writeText(kind==='caption'?caption:`${window.location.origin}/captions/${id}`);
   setMessage(kind==='caption'?'Caption copied!':'Link copied!');
  } catch {setMessage('Copy unavailable. Select the caption text or copy the address from its page.');}
 }
 return <div className="copy-actions"><div><button type="button" className="small-link" onClick={()=>copy('caption')}>Copy caption</button><button type="button" className="small-link" onClick={()=>copy('link')}>Copy link ↗</button></div><span role="status" className="tiny">{message}</span></div>;
}
