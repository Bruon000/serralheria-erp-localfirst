const API = import.meta.env.VITE_API_URL || "";export const auth = {  login: (email: string, password: string) =>    fetch(`${API}/auth/login`, {      method: "POST",      headers: { "Content-Type": "application/json" },      body: JSON.stringify({ email, password }),    }),  refresh: (refreshToken: string) =>    fetch(`${API}/auth/refresh`, {      method: "POST",      headers: { "Content-Type": "application/json" },      body: JSON.stringify({ refreshToken }),    }),};export const clients = `${API}/clients`;export const jobsites = `${API}/jobsites`;export const quotes = `${API}/quotes`;export const sync = `${API}/sync`;export const activityFeed = `${API}/activity-feed`;export const customFields = `${API}/custom-fields`;export const workflows = `${API}/workflows`;export const templates = `${API}/templates`;




