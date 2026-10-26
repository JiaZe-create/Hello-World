/** Never return raw provider errors: they can contain prompts, headers and keys. */
export function captionFailure(error: unknown): {code:string; status:number|null; message:string} {
 const seen=new Set<unknown>();
 let current=error;
 let status:number|null=null;
 let timeout=false;
 let invalidKey=false;
 let modelMissing=false;
 for(let depth=0;depth<6&&current&&typeof current==='object'&&!seen.has(current);depth++) {
  seen.add(current);
  const item=current as Record<string,unknown>;
  if(typeof item.statusCode==='number'&&Number.isInteger(item.statusCode))status=item.statusCode;
  const message=typeof item.message==='string'?item.message:'';
  timeout ||= item.name==='TimeoutError'||item.name==='AbortError'||/timed out|timeout/i.test(message);
  invalidKey ||= /API_KEY_INVALID|API key (?:not valid|expired)|invalid api key/i.test(message);
  modelMissing ||= /model.*(?:not found|not supported)|NOT_FOUND/i.test(message);
  current=item.lastError??item.cause;
 }
 if(invalidKey||status===401||status===403)return {code:'AI_AUTH',status,message:'The AI connection was rejected. The site owner needs to check the Google API key and its permissions.'};
 if(status===429)return {code:'AI_QUOTA',status,message:'The AI provider has reached a rate or quota limit. Please try later; the site owner may need to check the API quota or billing.'};
 if(status===404||modelMissing)return {code:'AI_MODEL',status,message:'The configured AI model is unavailable to this project. The site owner needs to check the model configuration.'};
 if(timeout)return {code:'AI_TIMEOUT',status,message:'The AI service took too long to respond. Please try again shortly.'};
 if(status!==null&&status>=500)return {code:'AI_UNAVAILABLE',status,message:'The AI provider is temporarily unavailable. Please try again shortly.'};
 if(status===400)return {code:'AI_REQUEST',status,message:'The AI provider rejected the generation settings. The site owner needs to check the model configuration.'};
 return {code:'AI_UNKNOWN',status,message:'The AI service could not finish this caption. Please try again shortly.'};
}
