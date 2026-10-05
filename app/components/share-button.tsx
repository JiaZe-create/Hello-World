'use client';
import { useState } from 'react';
export default function ShareButton({id}:{id:string}) {
 const [message,setMessage]=useState('Copy link');
 return <button className="small-link" onClick={async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}/captions/${id}`);setMessage('Link copied');}catch{setMessage('Open caption to copy URL');}}}><span aria-live="polite">{message}</span> ↗</button>;
}
