// Minimal IndexedDB wrapper with two object stores: "files" and "meta"
// Records in "files": {id, name, size, type, addedAt, blob}
// "meta": {key: 'activeFileId', value: id|null}

const DB_NAME = "clausewise-db";
const DB_VERSION = 1;

let dbPromise;

export function initDB(){
  if (!dbPromise){
    dbPromise = new Promise((resolve, reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("files")){
          const store = db.createObjectStore("files",{ keyPath:"id" });
          store.createIndex("addedAt","addedAt");
        }
        if (!db.objectStoreNames.contains("meta")){
          db.createObjectStore("meta",{ keyPath:"key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function withStore(storeName, mode, fn){
  const db = await initDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const res = fn(store, tx);
    tx.oncomplete = () => resolve(res);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveFiles(fileList){
  const files = Array.from(fileList);
  const saved = [];
  await withStore("files","readwrite",(store)=>{
    files.forEach(file=>{
      const id = crypto.randomUUID();
      const rec = { id, name:file.name, size:file.size, type:file.type, addedAt:Date.now(), blob:file };
      store.add(rec);
      saved.push(rec);
    });
  });
  return saved;
}

export async function listFiles(){
  const out = [];
  await withStore("files","readonly",(store)=>{
    const req = store.openCursor();
    req.onsuccess = e=>{
      const cursor = e.target.result;
      if (cursor){ out.push(({id,name,size,type,addedAt} = cursor.value, {id,name,size,type,addedAt})); cursor.continue(); }
    };
  });
  return out.sort((a,b)=>b.addedAt-a.addedAt);
}

export async function getFileBlob(id){
  return withStore("files","readonly",(store)=>{
    return new Promise((resolve,reject)=>{
      const r = store.get(id);
      r.onsuccess = ()=> resolve(r.result?.blob || null);
      r.onerror = ()=> reject(r.error);
    });
  });
}

export async function removeFile(id){
  await withStore("files","readwrite",(store)=>{ store.delete(id); });
  const active = await getActiveFileId();
  if (active === id) await setActiveFileId(null);
}

export async function clearAllFiles(){
  await withStore("files","readwrite",(store)=>store.clear());
  await withStore("meta","readwrite",(store)=>store.delete("activeFileId"));
  sessionStorage.removeItem("activeFileId");
}

export async function getActiveFileId(){
  const cached = sessionStorage.getItem("activeFileId");
  if (cached === "null") return null;
  if (cached) return cached;
  return withStore("meta","readonly",(store)=>{
    return new Promise((resolve)=>{
      const r = store.get("activeFileId");
      r.onsuccess = ()=> resolve(r.result?.value ?? null);
      r.onerror = ()=> resolve(null);
    });
  });
}

export async function setActiveFileId(id){
  sessionStorage.setItem("activeFileId", id ?? "null");
  await withStore("meta","readwrite",(store)=> store.put({key:"activeFileId", value:id ?? null}));
}