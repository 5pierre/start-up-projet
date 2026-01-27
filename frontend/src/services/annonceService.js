import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_ANNONCE_URL;
const API_URL = `${BASE_URL}/annonces`;

export const getAllAnnonces = async () => {
  try {
    return await axios.get(API_URL);
  } catch (error) {
    console.error('Error fetching annonces:', error);
    throw error;
  }
};

export const getSingleAnnonce = async (id) => {
  try {
    return await axios.get(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error fetching annonce ${id}:`, error);
    throw error;
  }
};

export const updateExistingAnnonce = async (id, payload) => {
  try {
    return await axios.put(`${API_URL}/${id}`, payload, {
      withCredentials: true
    });
  } catch (error) {
    console.error(`Error updating annonce ${id}:`, error);
    throw error;
  }
};

export const deleteExistingAnnonce = async (id) => {
  try {
    return await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
  } catch (error) {
    console.error(`Error deleting annonce ${id}:`, error);
    throw error;
  }
};

