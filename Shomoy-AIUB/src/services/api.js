import axios from 'axios';

// ⚠️ 'localhost' কাজ করবে না মোবাইল ডিভাইস/এমুলেটরে।
// Windows-এ cmd খুলে `ipconfig` চালান, "IPv4 Address" (যেমন 192.168.0.109) কপি করুন।
const BASE_URL = 'http://192.168.0.109:5000/api';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;