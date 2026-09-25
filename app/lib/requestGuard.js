const STORE_KEY="__nahlatyRequestBucketsV1";

function store(){
 if(!globalThis[STORE_KEY])globalThis[STORE_KEY]=new Map();
 return globalThis[STORE_KEY];
}

function hashText(value){
 let h=2166136261;
 const s=String(value||"anonymous");
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
 return (h>>>0).toString(36);
}

function identity(request){
 const headers=request?.headers;
 const ip=headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim()
  ||headers?.get?.("x-real-ip")
  ||headers?.get?.("cf-connecting-ip")
  ||"anonymous";
 const ua=headers?.get?.("user-agent")||"";
 return hashText(ip+"|"+ua.slice(0,120));
}

export function requestLimit(request,{scope="api",limit=30,windowMs=60_000}={}){
 if(request?.headers?.get?.("x-nahlaty-internal")==="1")return null;
 const now=Date.now();
 const key=scope+":"+identity(request);
 const buckets=store();
 let bucket=buckets.get(key);
 if(!bucket||now>=bucket.resetAt)bucket={count:0,resetAt:now+windowMs};
 bucket.count+=1;
 buckets.set(key,bucket);

 if(buckets.size>1200){
  for(const [k,v] of buckets){if(now>=v.resetAt)buckets.delete(k);}
 }

 if(bucket.count<=limit)return null;
 const retryAfter=Math.max(1,Math.ceil((bucket.resetAt-now)/1000));
 return Response.json(
  {error:"عدد الطلبات كبير حاليًا. جرّب بعد لحظات.",code:"RATE_LIMITED"},
  {status:429,headers:{"retry-after":String(retryAfter),"cache-control":"no-store"}}
 );
}

export function rateLimitInfo(){
 return {mode:"best-effort-instance-local",durable:false};
}
