import { requestLimit } from "../../lib/requestGuard";
import { generateRecraftVector } from "../../lib/recraftVector";
import { HEART_REFERENCE_ASSETS, HEART_REQUIRED_CONCEPT_IDS, HEART_SCENE_SPEC, HEART_SCIENTIFIC_SOURCES } from "../../lib/heartSemanticVector";

import { loadNiaidHeart, NIAID_HEART_ASSET } from "../../lib/niaidHeartAsset";
import { loadScienceHeart } from "../../lib/heartScienceAsset";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

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

function semanticEnvelope(){
 return {
  ready:false,
  sceneId:HEART_SCENE_SPEC.sceneId,
  requiredConceptIds:HEART_REQUIRED_CONCEPT_IDS,
  reason:"Native SVG geometry is ready; scientific element-to-concept binding is still required before runtime publication."
 };
}

export async function GET(req){
 if(new URL(req.url).searchParams.get("preset")==="heart"){
  try{return Response.json(await (new URL(req.url).searchParams.get("view")==="cutaway"?loadScienceHeart():loadNiaidHeart()),{headers:{"cache-control":"no-store"}})}
  catch(error){console.error("[NAHLATY_VECTOR_ERROR]",String(error?.message||error));return Response.json({ok:false,error:"تعذر تحميل أصل القلب",code:"HEART_ASSET_UNAVAILABLE"},{status:503})}
 }
 return Response.json({
  ok:true,
  configured:true,
  provider:"niaid-bioart",
  preset:"heart",
  spend:0,
  loginRequired:false,
  recraftOptional:Boolean(process.env.RECRAFT_API_TOKEN),
  providerAsset:NIAID_HEART_ASSET,
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
   return Response.json(await loadNiaidHeart(),{headers:{"cache-control":"no-store"}});
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
  return Response.json({ok:false,error:"تعذر تحميل الأصل المتجهي",code:"VECTOR_ASSET_FAILED"},{status:500,headers:{"cache-control":"no-store"}});
 }
}
