export const runtime="nodejs";
export const maxDuration=60;

export async function GET(req){
  const origin=new URL(req.url).origin;
  const started=Date.now();
  const res=await fetch(origin+"/api/static-visual",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({question:"كيف تنقل النحلة حبوب اللقاح بين الأزهار؟",audience:"عام"}),
    cache:"no-store"
  });
  const data=await res.json();
  const image=String(data?.image||"");
  return Response.json({
    ok:res.ok&&image.startsWith("data:image/"),
    upstreamStatus:res.status,
    title:data?.title||"",
    model:data?.model||"",
    benchmark:data?.benchmark||"",
    imageChars:image.length,
    elapsedMs:Date.now()-started,
    error:data?.error||"",
    detail:data?.detail||""
  },{status:res.ok?200:500});
}
