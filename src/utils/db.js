// Minimal IndexedDB wrapper with two object stores: "files" and "meta"
// Records in "files": {id, name, size, type, addedAt, blob}
// "meta": {key: 'activeFileId', value: id|null}

const DB_NAME = "clausewise-db";
const DB_VERSION = 1;

let dbPromise;

export function initDB(){
  if (!dbPromise){
    dbPromise = new Promise((resolve, reject)=>{
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        
        req.onupgradeneeded = (event) => {
          try {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("files")){
              const store = db.createObjectStore("files",{ keyPath:"id" });
              store.createIndex("addedAt","addedAt");
            }
            if (!db.objectStoreNames.contains("meta")){
              db.createObjectStore("meta",{ keyPath:"key" });
            }
          } catch (error) {
            console.error('Database upgrade error:', error);
            reject(error);
          }
        };
        
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (error) {
        reject(error);
      }
    });
  }
  return dbPromise;
}

async function withStore(storeName, mode, fn){
  try {
    const db = await initDB();
    return new Promise((resolve, reject)=>{
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
        
        const result = fn(store, tx);
        if (result !== undefined) {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    throw new Error(`Database operation failed: ${error.message}`);
  }
}

export async function saveFiles(fileList){
  try {
    const files = Array.from(fileList);
    const saved = [];
    
    await withStore("files","readwrite",(store)=>{
      files.forEach(file=>{
        try {
          const id = crypto.randomUUID();
          const rec = { 
            id, 
            name: file.name, 
            size: file.size, 
            type: file.type, 
            addedAt: Date.now(), 
            blob: file 
          };
          store.add(rec);
          saved.push(rec);
        } catch (error) {
          console.error('Error saving file:', file.name, error);
          throw error;
        }
      });
    });
    
    return saved;
  } catch (error) {
    console.error('SaveFiles error:', error);
    throw new Error(`Failed to save files: ${error.message}`);
  }
}

export async function listFiles(){
  try {
    const out = [];
    await withStore("files","readonly",(store)=>{
      return new Promise((resolve, reject) => {
        try {
          const req = store.openCursor();
          req.onsuccess = (e) => {
            try {
              const cursor = e.target.result;
              if (cursor) { 
                const {id, name, size, type, addedAt} = cursor.value;
                out.push({id, name, size, type, addedAt}); 
                cursor.continue(); 
              } else {
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          };
          req.onerror = () => reject(req.error);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    return out.sort((a,b)=>b.addedAt-a.addedAt);
  } catch (error) {
    console.error('ListFiles error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

export async function getFileBlob(id){
  try {
    return await withStore("files","readonly",(store)=>{
      return new Promise((resolve,reject)=>{
        try {
          const r = store.get(id);
          r.onsuccess = ()=> resolve(r.result?.blob || null);
          r.onerror = ()=> reject(r.error);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('GetFileBlob error:', error);
    throw new Error(`Failed to get file blob: ${error.message}`);
  }
}

export async function removeFile(id){
  try {
    await withStore("files","readwrite",(store)=> store.delete(id));
    const active = await getActiveFileId();
    if (active === id) {
      try {
        await setActiveFileId(null);
      } catch (error) {
        console.error('Failed to clear active file after removal:', error);
      }
    }
  } catch (error) {
    console.error('RemoveFile error:', error);
    throw new Error(`Failed to remove file: ${error.message}`);
  }
}

export async function clearAllFiles(){
  try {
    await withStore("files","readwrite",(store)=>store.clear());
    await withStore("meta","readwrite",(store)=>store.delete("activeFileId"));
    sessionStorage.removeItem("activeFileId");
  } catch (error) {
    console.error('ClearAllFiles error:', error);
    throw new Error(`Failed to clear all files: ${error.message}`);
  }
}

export async function getActiveFileId(){
  try {
    const cached = sessionStorage.getItem("activeFileId");
    if (cached === "null") return null;
    if (cached) return cached;
    
    return await withStore("meta","readonly",(store)=>{
      return new Promise((resolve)=>{
        try {
          const r = store.get("activeFileId");
          r.onsuccess = ()=> resolve(r.result?.value ?? null);
          r.onerror = ()=> resolve(null);
        } catch (error) {
          console.error('GetActiveFileId error:', error);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('GetActiveFileId error:', error);
    return null;
  }
}

export async function setActiveFileId(id){
  try {
    sessionStorage.setItem("activeFileId", id ?? "null");
    await withStore("meta","readwrite",(store)=> store.put({key:"activeFileId", value:id ?? null}));
  } catch (error) {
    console.error('SetActiveFileId error:', error);
    throw new Error(`Failed to set active file ID: ${error.message}`);
  }
}