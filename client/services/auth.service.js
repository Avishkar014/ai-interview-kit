import api from "./api";

export const authService = {
  me: () => api.get("/auth/me").then((response) => response.data.user),
  login: (payload) => api.post("/auth/login", payload).then((response) => response.data.user),
  register: (payload) => api.post("/auth/register", payload).then((response) => response.data.user),
  logout: () => api.post("/auth/logout"),
};