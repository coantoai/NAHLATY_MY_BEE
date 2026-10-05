import { requestLimit } from "../../lib/requestGuard";
import { generateRecraftVector, validateProviderSvg } from "../../lib/recraftVector";
import { HEART_REFERENCE_ASSETS, HEART_REQUIRED_CONCEPT_IDS, HEART_SCENE_SPEC, HEART_SCIENTIFIC_SOURCES } from "../../lib/heartSemanticVector";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

const NIAID_HEART_URL="https://bioart.niaid.nih.gov/api/bioarts/228/files/630873";
const NIAID_HEART_PAGE="https://bioart.niaid.nih.gov/bioart/228";
const HEART_PROMPT=`Premium scientific vector illustration of the human heart for an interactive educational product. Anatomically coherent external and cutaway view in one clean composition. Clearly distinguish four chambers, four cardiac valves, venae cavae, pulmonary artery, pulmonary veins, aorta, and myocardium. Modern medical-atlas quality with realistic depth cues expressed as native vector shapes, sophisticated restrained shading, precise vessel geometry, elegant dark-background presentation, no childish styling. No words, no letters, no numbers, no captions, no legend, no UI cards, no infographic panels, no logo, no watermark. Keep major anatomical regions visually separable so each can later be mapped to independent semantic SVG groups.`;

function str(value,max=10000){
 return String(value||"").trim().slice(0,max);
}

function defaultHeartStyleReferences(body={}){
 if(body?.styleId)return [];
 const supplied=Array.isArray(body?.styleReferenceUrls)?body.styleReferenceUrls.filter(Boolean):[];
 if(supplied.length)return supplied;
 if(body?.model)return [];
 return HEART_REFERENCE_ASSETS.map(item=>item.publicUrl);
}

function normalizeNiaidSvg(source){
 return String(source||"")
  .replace(/<\/?ns0:/g,match=>match.startsWith("</")?"</":"<")
  .replace(/\bns0:/g,"")
  .replace(/\bns1:href=/g,"xlink:href=")
  .replace(/xmlns:ns0="http:\/\/www\.w3\.org\/2000\/svg"/g,'xmlns="http://www.w3.org/2000/svg"')
  .replace(/xmlns:ns1="http:\/\/www\.w3\.org\/1999\/xlink"/g,'xmlns:xlink="http://www.w3.org/1999/xlink"');
}

async function fetchNiaidHeart(fetchImpl=fetch){
 const response=await fetchImpl(NIAID_HEART_URL,{redirect:"follow",cache:"no-store"});
 if(!response.ok)throw new Error(`NIAID SVG download failed (${response.status})`);
 const svg=normalizeNiaidSvg(await response.text());
 return validateProviderSvg(svg);
}

function semanticEnvelope(){
 return {
  ready:false,
  sceneId:HEART_SCENE_SPEC.sceneId,
  requiredConceptIds:HEART_REQUIRED_CONCEPT_IDS,
  reason:"Native SVG geometry is ready; scientific element-to-concept binding is still required before runtime publication."
 };
}

export async function GET(){
 return Response.json({
  ok:true,
  configured:true,
  provider:"niaid-bioart",
  preset:"heart",
  spend:0,
  loginRequired:false,
  recraftOptional:Boolean(process.env.RECRAFT_API_TOKEN),
  providerAsset:{url:NIAID_HEART_URL,page:NIAID_HEART_PAGE,license:"Public Domain",credit:"Courtesy of NIAID / Ryan Kissinger"},
  referenceAssets:HEART_REFERENCE_ASSETS,
  scientificSources:HEART_SCIENTIFIC_SOURCES,
  semanticReady:false
 },{headers:{"cache-control":"no-store"}});
}

export async function POST(req){
 const blocked=requestLimit(req,{scope:"premium-vector-generation",limit:4,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const body=await req.json().catch(()=>({}));
  const preset=body?.preset==="heart"?"heart":"";
  const provider=body?.provider==="recraft"?"recraft":"niaid";

  if(provider==="niaid"){
   if(preset!=="heart")return Response.json({ok:false,error:"NIAID preset currently supports heart only"},{status:400});
   const result=await fetchNiaidHeart();
   return Response.json({
    ok:true,
    provider:"niaid-bioart",
    output:"native-svg",
    svg:result.svg,
    metrics:{bytes:result.bytes,pathCount:result.pathCount,groupCount:result.groupCount},
    billing:{credits:0,model:"NIH BioArt editable SVG"},
    providerAsset:{url:NIAID_HEART_URL,page:NIAID_HEART_PAGE,license:"Public Domain",credit:"Courtesy of NIAID / Ryan Kissinger"},
    referenceAssets:HEART_REFERENCE_ASSETS,
    scientificSources:HEART_SCIENTIFIC_SOURCES,
    semantic:semanticEnvelope()
   },{headers:{"cache-control":"no-store"}});
  }

  if(!process.env.RECRAFT_API_TOKEN){
   return Response.json({
    ok:false,
    error:"RECRAFT_API_TOKEN is not configured",
    code:"RECRAFT_NOT_CONFIGURED",
    spend:0
   },{status:503,headers:{"cache-control":"no-store"}});
  }

  const prompt=preset==="heart"?HEART_PROMPT:str(body?.prompt);
  if(!prompt)return Response.json({ok:false,error:"prompt required"},{status:400});
  const styleReferenceUrls=preset==="heart"?defaultHeartStyleReferences(body):(Array.isArray(body?.styleReferenceUrls)?body.styleReferenceUrls:[]);

  const result=await generateRecraftVector({
   prompt,
   model:body?.model,
   size:body?.size||"4:3",
   styleId:body?.styleId,
   styleReferenceUrls,
   styleMatch:body?.styleMatch,
   randomSeed:body?.randomSeed,
   negativePrompt:body?.negativePrompt
  });

  return Response.json({
   ok:true,
   provider:"recraft",
   output:"native-svg",
   svg:result.svg,
   metrics:{bytes:result.bytes,pathCount:result.pathCount,groupCount:result.groupCount},
   billing:{credits:result.credits,model:result.model},
   providerAsset:{imageId:result.imageId,styleId:result.styleId,revisedPrompt:result.revisedPrompt},
   referenceAssets:preset==="heart"?HEART_REFERENCE_ASSETS:[],
   scientificSources:preset==="heart"?HEART_SCIENTIFIC_SOURCES:[],
   semantic:preset==="heart"?semanticEnvelope():{ready:false,reason:"Semantic binding is required before runtime publication."}
  },{headers:{"cache-control":"no-store"}});
 }catch(error){
  console.error("[NAHLATY_VECTOR_ERROR]",String(error?.message||error));
  return Response.json({ok:false,error:String(error?.message||error)},{status:500,headers:{"cache-control":"no-store"}});
 }
}
