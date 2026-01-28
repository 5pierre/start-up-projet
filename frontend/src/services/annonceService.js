import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_ANNONCE_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/annonces`;

export const getAllAnnonces = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching annonces:', error);
    throw error;
  }
};

export const getSingleAnnonce = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching annonce ${id}:`, error);
    throw error;
  }
};

export const updateExistingAnnonce = async (id, payload) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating annonce ${id}:`, error);
    throw error;
  }
};

export const deleteExistingAnnonce = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting annonce ${id}:`, error);
    throw error;
  }
};

export const generateAnnonceFromAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    // ✅ Correction : utilise BASE_URL directement (la route est /api/from-audio)
    const response = await axios.post(`${BASE_URL}/from-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating annonce from audio:', error);
    throw error;
  }
};