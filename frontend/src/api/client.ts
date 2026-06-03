import axios from 'axios'

// Central Axios instance. Same-origin /api — the Vite dev server proxies to the
// backend, which holds the provider key. The browser never sees the key.
export const apiClient = axios.create({
  baseURL: '/api',
})
