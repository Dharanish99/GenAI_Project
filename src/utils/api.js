import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/upload/',
  FEATURES: '/features/',
  DIAGRAM: '/diagram',
  CHATBOT: '/chatbot/',
};

// Upload documents
export const uploadDocuments = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  try {
    const response = await api.post(API_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to upload documents');
  }
};

// Run features
export const runFeature = async (projectId, featureName) => {
  try {
    const response = await api.post(API_ENDPOINTS.FEATURES, {
      project_id: projectId,
      feature_name: featureName,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to run feature');
  }
};

// Get relationship diagram
export const getRelationshipDiagram = async (projectId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.DIAGRAM}/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get diagram');
  }
};

// Ask chatbot
export const askChatbot = async (projectId, query) => {
  try {
    const response = await api.post(API_ENDPOINTS.CHATBOT, {
      project_id: projectId,
      query: query,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get chatbot response');
  }
};

export default api;
