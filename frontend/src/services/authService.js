import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_AUTH_URL || 'http://localhost:4000';

export const checkAdminAccess = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
};
  
export const logout = async () => {
    try {
      // URL propre via Nginx
      await axios.post(`${BASE_URL}/logout`, {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = '/register'; 
    }
};