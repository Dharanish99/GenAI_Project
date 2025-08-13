import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initDB, saveFiles as dbSaveFiles, listFiles, removeFile as dbRemoveFile, clearAllFiles as dbClearAll, getActiveFileId, setActiveFileId } from "../utils/db.js";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      const [fs, aid] = await Promise.all([listFiles(), getActiveFileId()]);
      setFiles(fs);
      setActiveId(aid);
      setReady(true);
    })();
  }, []);

  const uploadFiles = async (fileList) => {
    setLoading(true);
    try {
      // Save files to IndexedDB
      const saved = await dbSaveFiles(fileList);
      const newList = await listFiles();
      setFiles(newList);
      
      if (!activeId && saved[0]) {
        await setActiveFileId(saved[0].id);
        setActiveId(saved[0].id);
      }

      // Upload to backend
      const formData = new FormData();
      Array.from(fileList).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProjectId(result.project_id);
        return { success: true, data: result };
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (id) => {
    await dbRemoveFile(id);
    const newList = await listFiles();
    setFiles(newList);
    const aid = await getActiveFileId();
    setActiveId(aid);
  };

  const clearAllFiles = async () => {
    await dbClearAll();
    setFiles([]);
    setActiveId(null);
    setProjectId(null);
  };

  const setActive = async (id) => {
    await setActiveFileId(id);
    setActiveId(id);
  };

  const runFeature = async (featureName) => {
    if (!projectId) {
      throw new Error('No project available');
    }

    const response = await fetch('/api/features/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        feature_name: featureName,
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Feature execution failed');
    }
  };

  const askChatbot = async (query) => {
    if (!projectId) {
      throw new Error('No project available');
    }

    const response = await fetch('/api/chatbot/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        query: query,
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Chatbot query failed');
    }
  };

  const value = useMemo(() => ({
    files,
    activeId,
    projectId,
    ready,
    loading,
    uploadFiles,
    removeFile,
    clearAllFiles,
    setActive,
    runFeature,
    askChatbot,
  }), [files, activeId, projectId, ready, loading]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}