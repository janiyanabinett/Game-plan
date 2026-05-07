import axios from 'axios';

// In dev: VITE_API_URL is empty → Vite proxy handles /api/* → localhost:3001
// In prod: VITE_API_URL is your Railway backend URL → calls go directly there
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: BASE_URL });
