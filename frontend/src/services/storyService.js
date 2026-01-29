import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_STORY_URL || 'http://localhost:5000';
// On pointe vers /api/story/stories
const API_URL = `${BASE_URL}/api/story/stories`;

/**
 * Récupère toutes les annonces
 */
export const getStories = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    // Ne pas logger les erreurs CORS comme des erreurs critiques si le backend n'est pas disponible
    if (error.response?.status === 403 || error.code === 'ERR_NETWORK') {
      console.log('Backend non disponible ou erreur CORS. Vérifiez que FRONTEND_ORIGIN inclut votre origine dans le backend.');
    } else {
      console.error('Error fetching stories:', error);
    }
    throw error;
  }
};

/**
 * Récupère quelques annonces récentes (pour l'accueil)
 * @param {number} limit - Nombre d'annonces à récupérer (par défaut 3)
 */
export const getRecentStories = async (limit = 3) => {
  try {
    const response = await axios.get(`${API_URL}?limit=${limit}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    // Ne pas logger les erreurs CORS comme des erreurs critiques si le backend n'est pas disponible
    if (error.response?.status === 403 || error.code === 'ERR_NETWORK') {
      console.log('Backend non disponible ou erreur CORS. Vérifiez que FRONTEND_ORIGIN inclut votre origine dans le backend.');
    } else {
      console.error('Error fetching recent stories:', error);
    }
    throw error;
  }
};

/**
 * Récupère une annonce par son ID
 * @param {number|string} storyId - ID de l'annonce
 */
export const getStoryById = async (storyId) => {
  try {
    const response = await axios.get(`${API_URL}/${storyId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching story by id:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle annonce
 * @param {Object} story - Données de l'annonce (title, content, etc.)
 */
export const createStory = async (story) => {
  try {
    const response = await axios.post(API_URL, story, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

/**
 * Met à jour une annonce existante
 * @param {number|string} storyId - ID de l'annonce
 * @param {Object} story - Données mises à jour de l'annonce
 */
export const updateStory = async (storyId, story) => {
  try {
    const response = await axios.put(`${API_URL}/${storyId}`, story, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

/**
 * Supprime une annonce
 * @param {number|string} storyId - ID de l'annonce
 */
export const deleteStory = async (storyId) => {
  try {
    const response = await axios.delete(`${API_URL}/${storyId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};
