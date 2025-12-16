import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5162';

const client = axios.create({
  baseURL,
  timeout: 8000,
});

export default client;
