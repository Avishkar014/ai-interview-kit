import api from "./api";

export const practiceService = {
  list: (kitId) => api.get(`/practice/${kitId}`).then((response) => response.data.flashcards),
  save: (kitId, payload) => api.post(`/practice/${kitId}`, payload).then((response) => response.data.practice),
};