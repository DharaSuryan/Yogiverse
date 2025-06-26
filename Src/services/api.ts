import axios from 'axios';

const API_BASE_URL = 'YOUR_API_BASE_URL';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
