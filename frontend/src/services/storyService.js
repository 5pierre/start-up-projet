import axios from 'axios';

const API_URL =  'http://localhost:4000/api/story';

export const getStories = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};