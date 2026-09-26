// Private, browser-local visual journey archive.
// IndexedDB is used instead of localStorage because generated images are large.
const DB_NAME = "nahlaty-living-journal";
const VERSION = 1;
let opening;

export function makeId(){
 return typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function"
  ?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openJournal(){
 if(typeof indexedDB==="undefined")return Promise.reject(new Error("BROWSER_STORAGE_UNAVAILABLE"));
 if(opening)return opening;
 opening=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,VERSION);
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains("worlds"))db.createObjectStore("worlds",{keyPath:"id"});
   if(!db.objectStoreNames.contains("turns")){
    const turns=db.createObjectStore("turns",{keyPath:"id"});
    turns.createIndex("byWorld","worldId",{unique:false});
   }
  };
  req.onsuccess=()=>{
   const db=req.result;
   db.onversionchange=()=>db.close();
   resolve(db);
  };
  req.onerror=()=>reject(req.error||new Error("BROWSER_STORAGE_UNAVAILABLE"));
  req.onblocked=()=>reject(new Error("BROWSER_STORAGE_BLOCKED"));
 }).catch(error=>{opening=null;throw error;});
 return opening;
}

export async function storeTurn(world,turn){
 const db=await openJournal();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(["worlds","turns"],"readwrite");
  tx.oncomplete=()=>resolve(true);
  tx.onabort=()=>reject(tx.error||new Error("SAVE_FAILED"));
  tx.onerror=()=>reject(tx.error||new Error("SAVE_FAILED"));
  tx.objectStore("worlds").put({...world,updatedAt:Date.now()});
  tx.objectStore("turns").put(turn);
 });
}

function readAll(store,indexValue){
 return openJournal().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction(store,"readonly");
  const req=indexValue===undefined?tx.objectStore(store).getAll():tx.objectStore(store).index("byWorld").getAll(indexValue);
  req.onsuccess=()=>resolve(req.result||[]);
  req.onerror=()=>reject(req.error||new Error("LOAD_FAILED"));
 }));
}

export async function listWorlds(){
 const values=await readAll("worlds");
 return values.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
}

export async function listTurns(worldId){
 const values=await readAll("turns",worldId);
 return values.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)||(a.id>b.id?1:-1));
}
