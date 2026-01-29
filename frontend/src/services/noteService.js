import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_NOTE_URL;

export async function getUserRatingSummary(userId) {
  return axios.get(`${BASE_URL}/users/${userId}/summary`, { withCredentials: true });
}

export async function getUserComments(userId) {
  return axios.get(`${BASE_URL}/users/${userId}/comments`, { withCredentials: true });
}

export async function getMyRating(ratedUserId) {
  return axios.get(`${BASE_URL}/ratings/me/${ratedUserId}`, { withCredentials: true });
}

// ratedUserId: number, stars: 1..5, comment?: string
export async function rateUser({ ratedUserId, stars, comment }) {
  return axios.post(
    `${BASE_URL}/ratings`,
    { ratedUserId, stars, comment },
    { withCredentials: true }
  );
}

