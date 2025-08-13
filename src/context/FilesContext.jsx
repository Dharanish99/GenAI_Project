import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initDB, saveFiles as dbSaveFiles, listFiles, removeFile as dbRemoveFile, clearAllFiles as dbClearAll, getActiveFileId, setActiveFileId } from "../utils/db.js";

const FilesCtx = createContext(null);

export function FilesProvider({children}){
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(()=>{ (async ()=>{
    await initDB();
    const [fs, aid] = await Promise.all([listFiles(), getActiveFileId()]);
    setFiles(fs);
    setActiveId(aid);
    setReady(true);
  })(); },[]);

  const saveFiles = async (fileList)=>{
    const saved = await dbSaveFiles(fileList);
    const newList = await listFiles();
    setFiles(newList);
    if (!activeId && saved[0]){ await setActiveFileId(saved[0].id); setActiveId(saved[0].id); }
    return saved;
  };

  const removeFile = async (id)=>{
    await dbRemoveFile(id);
    const newList = await listFiles();
    setFiles(newList);
    const aid = await getActiveFileId();
    setActiveId(aid);
  };

  const clearAllFiles = async ()=>{
    await dbClearAll();
    setFiles([]); setActiveId(null);
  };

  const setActive = async (id)=>{
    await setActiveFileId(id);
    setActiveId(id);
  }

  const value = useMemo(()=>({ files, activeId, ready, saveFiles, removeFile, clearAllFiles, setActive }),[files, activeId, ready]);

  return <FilesCtx.Provider value={value}>{children}</FilesCtx.Provider>;
}

export function useFiles(){
  const ctx = useContext(FilesCtx);
  if (!ctx) throw new Error("useFiles must be used within FilesProvider");
  return ctx;
}