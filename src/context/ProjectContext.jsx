import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initDB, saveFiles as dbSaveFiles, listFiles, removeFile as dbRemoveFile, clearAllFiles as dbClearAll, getActiveFileId, setActiveFileId } from "../utils/db.js";
import { uploadDocuments, runFeature as apiRunFeature, askChatbot as apiAskChatbot } from "../utils/api.js";

const ProjectContext = createContext(null);

// Fallback storage using localStorage if IndexedDB fails
const fallbackStorage = {
  files: [],
  activeId: null,
  
  saveFiles: (fileList) => {
    try {
      const files = Array.from(fileList).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        addedAt: Date.now()
      }));
      
      const existing = JSON.parse(localStorage.getItem('clausewise-files') || '[]');
      const updated = [...files, ...existing];
      localStorage.setItem('clausewise-files', JSON.stringify(updated));
      
      return files;
    } catch (error) {
      console.error('Fallback storage save error:', error);
      throw error;
    }
  },
  
  listFiles: () => {
    try {
      return JSON.parse(localStorage.getItem('clausewise-files') || '[]');
    } catch (error) {
      console.error('Fallback storage list error:', error);
      return [];
    }
  },
  
  removeFile: (id) => {
    try {
      const files = JSON.parse(localStorage.getItem('clausewise-files') || '[]');
      const updated = files.filter(f => f.id !== id);
      localStorage.setItem('clausewise-files', JSON.stringify(updated));
      
      const activeId = localStorage.getItem('clausewise-activeId');
      if (activeId === id) {
        localStorage.removeItem('clausewise-activeId');
      }
    } catch (error) {
      console.error('Fallback storage remove error:', error);
    }
  },
  
  clearAllFiles: () => {
    try {
      localStorage.removeItem('clausewise-files');
      localStorage.removeItem('clausewise-activeId');
    } catch (error) {
      console.error('Fallback storage clear error:', error);
    }
  },
  
  getActiveFileId: () => {
    try {
      return localStorage.getItem('clausewise-activeId') || null;
    } catch (error) {
      console.error('Fallback storage getActive error:', error);
      return null;
    }
  },
  
  setActiveFileId: (id) => {
    try {
      if (id) {
        localStorage.setItem('clausewise-activeId', id);
      } else {
        localStorage.removeItem('clausewise-activeId');
      }
    } catch (error) {
      console.error('Fallback storage setActive error:', error);
    }
  }
};

export function ProjectProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [lastUploadedFiles, setLastUploadedFiles] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const [fs, aid] = await Promise.all([listFiles(), getActiveFileId()]);
        setFiles(fs);
        setActiveId(aid);
        setReady(true);
      } catch (error) {
        console.error('Failed to initialize IndexedDB, using fallback storage:', error);
        setUseFallback(true);
        
        // Use fallback storage
        const fs = fallbackStorage.listFiles();
        const aid = fallbackStorage.getActiveFileId();
        setFiles(fs);
        setActiveId(aid);
        setReady(true);
      }
    })();
  }, []);

  const uploadFiles = async (fileList) => {
    setLoading(true);
    try {
      // Validate fileList
      if (!fileList || !Array.isArray(fileList) || fileList.length === 0) {
        throw new Error('Invalid file list provided');
      }

      // First, upload to backend
      const backendResponse = await uploadDocuments(fileList);
      const newProjectId = backendResponse.project_id;
      setProjectId(newProjectId);

      // Then save to local storage
      let saved;
      if (useFallback) {
        saved = fallbackStorage.saveFiles(fileList);
      } else {
        try {
          saved = await dbSaveFiles(fileList);
        } catch (dbError) {
          console.error('IndexedDB save error, switching to fallback:', dbError);
          setUseFallback(true);
          saved = fallbackStorage.saveFiles(fileList);
        }
      }

      // Update file list
      let newList;
      if (useFallback) {
        newList = fallbackStorage.listFiles();
      } else {
        try {
          newList = await listFiles();
        } catch (listError) {
          console.error('Failed to list files after save:', listError);
          newList = saved;
        }
      }
      
      setFiles(newList);
      
      // Set active file if none exists
      if (!activeId && saved && saved[0]) {
        try {
          if (useFallback) {
            fallbackStorage.setActiveFileId(saved[0].id);
          } else {
            await setActiveFileId(saved[0].id);
          }
          setActiveId(saved[0].id);
        } catch (activeError) {
          console.error('Failed to set active file:', activeError);
        }
      }

      console.log('Files uploaded successfully, project ID:', newProjectId);
      
      // Store the uploaded files and show the feature selection modal
      setLastUploadedFiles(saved);
      setShowFeatureModal(true);
      
      return { success: true, data: { project_id: newProjectId } };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload files. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (id) => {
    try {
      if (useFallback) {
        fallbackStorage.removeFile(id);
      } else {
        await dbRemoveFile(id);
      }
      
      const newList = useFallback ? fallbackStorage.listFiles() : await listFiles();
      setFiles(newList);
      
      const aid = useFallback ? fallbackStorage.getActiveFileId() : await getActiveFileId();
      setActiveId(aid);
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const clearAllFiles = async () => {
    try {
      if (useFallback) {
        fallbackStorage.clearAllFiles();
      } else {
        await dbClearAll();
      }
      
      setFiles([]);
      setActiveId(null);
      setProjectId(null);
    } catch (error) {
      console.error('Failed to clear files:', error);
    }
  };

  const setActive = async (id) => {
    try {
      if (useFallback) {
        fallbackStorage.setActiveFileId(id);
      } else {
        await setActiveFileId(id);
      }
      setActiveId(id);
    } catch (error) {
      console.error('Failed to set active file:', error);
    }
  };

  const closeFeatureModal = () => {
    setShowFeatureModal(false);
    setLastUploadedFiles([]);
  };

  const runFeature = async (featureName) => {
    if (!projectId) {
      throw new Error('No project available');
    }

    try {
      const result = await apiRunFeature(projectId, featureName);
      return result;
    } catch (error) {
      console.error('Feature execution error:', error);
      throw error;
    }
  };

  const askChatbot = async (query) => {
    if (!projectId) {
      throw new Error('No project available');
    }

    try {
      const result = await apiAskChatbot(projectId, query);
      return result;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    files,
    activeId,
    projectId,
    ready,
    loading,
    showFeatureModal,
    lastUploadedFiles,
    uploadFiles,
    removeFile,
    clearAllFiles,
    setActive,
    closeFeatureModal,
    runFeature,
    askChatbot,
  }), [files, activeId, projectId, ready, loading, showFeatureModal, lastUploadedFiles]);

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