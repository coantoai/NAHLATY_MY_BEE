const BASE="https://external.api.recraft.ai/v1";

export const RECRAFT_VECTOR_MODELS=Object.freeze([
 "recraftv4_1_vector",
 "recraftv4_1_pro_vector",
 "recraftv4_styles_vector",
 "recraftv4_styles_pro_vector"
]);

const MODEL_SET=new Set(RECRAFT_VECTOR_MODELS);
const STYLE_MODELS=new Set(["recraftv4_styles_vector","recraftv4_styles_pro_vector"]);
const SAFE_SIZES=new Set(["1:1","4:3","3:4","3:2","2:3","16:9","9:16","2:1","1:2","2048x1024","1024x2048"]);

function text(value,max=10000){
 return String(value||"").trim().slice(0,max);
}
function isReference(value){
 const v=String(value||"").trim();
 return /^https:\/\//i.test(v)||/^data:image\/(png|jpe?g|webp);base64,/i.test(v);
}

export function normalizeRecraftVectorRequest(input={}){
 const prompt=text(input.prompt);
 if(!prompt)throw new Error("prompt required");

 const references=(Array.isArray(input.styleReferenceUrls)?input.styleReferenceUrls:[])
  .map(v=>String(v||"").trim())
  .filter(isReference)
  .slice(0,10);
 const styleId=text(input.styleId,120);
 if(styleId&&references.length)throw new Error("Use styleId or styleReferenceUrls, not both");

 let model=MODEL_SET.has(input.model)?input.model:"";
 if(!model)model=(styleId||references.length)?"recraftv4_styles_pro_vector":"recraftv4_1_vector";
 if(STYLE_MODELS.has(model)&&!styleId&&!references.length)throw new Error("V4 Styles vector requires styleId or styleReferenceUrls");
 if(!STYLE_MODELS.has(model)&&(styleId||references.length))throw new Error("Style references require a V4 Styles vector model");

 const styleMatch=input.styleMatch==="flexible"?"flexible":"precise";
 const size=SAFE_SIZES.has(String(input.size||""))?String(input.size):"4:3";
 const seed=Number.isInteger(input.randomSeed)&&input.randomSeed>=0&&input.randomSeed<=4294967295?input.randomSeed:undefined;

 return {
  prompt,
  model,
  size,
  n:1,
  response_format:"url",
  ...(styleId?{style_id:styleId}:{}),
  ...(references.length?{style_reference_urls:references}:{}),
  ...(STYLE_MODELS.has(model)?{style_match:styleMatch}:{}),
  ...(seed!==undefined?{random_seed:seed}:{}),
  negative_prompt:text(input.negativePrompt||"text, letters, labels, watermark, logo, infographic panels, cartoon, school diagram",1200)
 };
}

export function buildRecraftVectorRequest(input={}){
 const body=normalizeRecraftVectorRequest(input);
 return {
  url:`${BASE}/images/generations/vector`,
  init:{
   method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify(body)
  },
  body
 };
}

export function validateProviderSvg(svg){
 const source=String(svg||"");
 if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(source))throw new Error("Provider did not return SVG");
 const forbidden=[
  /<script\b/i,
  /<foreignObject\b/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<image\b/i,
  /<\s*(?:animate\w*|set|discard|handler|listener)\b/i,
  /<!DOCTYPE|<!ENTITY/i,
  /<\?[^x]|<\?xml-stylesheet/i,
  /\son[a-z]+\s*=/i,
  /(?:href|xlink:href)\s*=\s*["'](?!#[A-Za-z_][A-Za-z0-9_:.-]*["'])/i,
  /url\(\s*["']?(?!#[A-Za-z_][A-Za-z0-9_:.-]*["']?\s*\))/i,
  /@|\\/,
  /<\/?[A-Za-z_][\w.-]*:/,
  /(?:javascript|vbscript|data)\s*:/i
 ];
 if(forbidden.some(re=>re.test(source)))throw new Error("Unsafe SVG content rejected");
 const ids=[...source.matchAll(/\s+id\s*=\s*["']([^"']+)["']/g)].map(x=>x[1]);
 if(new Set(ids).size!==ids.length)throw new Error("Duplicate SVG IDs rejected");
 const pathCount=(source.match(/<path\b/gi)||[]).length;
 const groupCount=(source.match(/<g\b/gi)||[]).length;
 if(pathCount<4)throw new Error("SVG geometry is too shallow for a premium semantic asset");
 return {svg:source,pathCount,groupCount,bytes:new TextEncoder().encode(source).byteLength};
}

export function scopeInlineSvgStyles(svg,scope){
 if(!/^\.[A-Za-z_][A-Za-z0-9_-]*$/.test(scope))throw new Error("Invalid SVG style scope");
 return String(svg).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(_,open,css,close)=>
  open+css.replace(/(^|})([^{}]+)\{/g,(_,end,selectors)=>end+selectors.split(",").map(selector=>scope+" > svg "+selector.trim()).join(",")+"{")+close);
}

export async function generateRecraftVector(input,{token=process.env.RECRAFT_API_TOKEN,fetchImpl=fetch}={}){
 if(!token)throw new Error("RECRAFT_API_TOKEN is not configured");
 const request=buildRecraftVectorRequest(input);
 const response=await fetchImpl(request.url,{
  ...request.init,
  headers:{...request.init.headers,authorization:`Bearer ${token}`}
 });
 const payload=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(payload?.message||payload?.error||`Recraft vector generation failed (${response.status})`);

 const item=Array.isArray(payload?.data)?payload.data[0]:null;
 const assetUrl=item?.url;
 if(!assetUrl||!/^https:\/\//i.test(assetUrl))throw new Error("Recraft returned no vector URL");

 const assetResponse=await fetchImpl(assetUrl,{redirect:"follow"});
 if(!assetResponse.ok)throw new Error(`Recraft SVG download failed (${assetResponse.status})`);
 const svg=await assetResponse.text();
 const checked=validateProviderSvg(svg);
 return {
  ...checked,
  model:request.body.model,
  credits:Number.isFinite(payload?.credits)?payload.credits:null,
  imageId:item?.image_id||null,
  revisedPrompt:item?.revised_prompt||null,
  styleId:payload?.style_id||item?.style_id||null
 };
}
