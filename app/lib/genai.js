export const QWEN_MODEL=process.env.QWEN_TEXT_MODEL||process.env.QWEN_VISION_MODEL||"qwen3-vl-flash";
const BASE=(process.env.DASHSCOPE_BASE_URL||"https://dashscope-intl.aliyuncs.com").replace(/\/$/,"");
const ENDPOINT=`${BASE}/compatible-mode/v1/chat/completions`;

export function createGemini(apiKey=process.env.DASHSCOPE_API_KEY){
 if(!apiKey)return null;
 return {apiKey,provider:"qwen"};
}
export function genAIErrorStatus(error){
 const direct=Number(error?.status||error?.code||error?.error?.code);
 if(Number.isFinite(direct)&&direct>0)return direct;
 const m=String(error?.message||error||"").match(/\b(429|500|502|503|504)\b/);
 return m?Number(m[1]):0;
}
export function isTransientGenAIError(error){return [429,500,502,503,504].includes(genAIErrorStatus(error));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function call(ai,content,{json=false,maxTokens=7000}={}){
 const r=await fetch(ENDPOINT,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${ai.apiKey}`},body:JSON.stringify({model:QWEN_MODEL,messages:[{role:"user",content}],temperature:.15,max_tokens:maxTokens,enable_thinking:false,response_format:json?{type:"json_object"}:undefined})});
 const p=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(p?.error?.message||p?.message||`Qwen request failed (${r.status})`),{status:r.status});
 return String(p?.choices?.[0]?.message?.content||"").trim();
}
export async function generateJson(ai,prompt,{maxAttempts=3,retryBaseMs=400}={}){
 let last;
 for(let n=1;n<=Math.max(1,maxAttempts);n++)try{
  const raw=(await call(ai,n===1?prompt:`${prompt}\nReturn one complete valid JSON object only.`,{json:true})).replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
  return JSON.parse(raw.replace(/,\s*([}\]])/g,"$1"));
 }catch(e){last=e;if((!isTransientGenAIError(e)&&!(e instanceof SyntaxError))||n>=maxAttempts)throw e;await sleep(retryBaseMs*n);}
 throw last;
}
export async function generateText(ai,contents,{maxAttempts=3,retryBaseMs=400}={}){
 let last;
 const content=typeof contents==="string"?contents:JSON.stringify(contents);
 for(let n=1;n<=Math.max(1,maxAttempts);n++)try{return await call(ai,content,{maxTokens:1800});}catch(e){last=e;if(!isTransientGenAIError(e)||n>=maxAttempts)throw e;await sleep(retryBaseMs*n);}
 throw last;
}
