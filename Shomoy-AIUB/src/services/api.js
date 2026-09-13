import axios from 'axios';


const BASE_URL = 'https://shomoy-server.onrender.com/api';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;