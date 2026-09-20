import api from "./api";

export const kitsService = {
  list: () =>
    api.get("/kits").then((response) => response.data.kits),

  create: (payload) =>
    api.post("/kits", payload).then((response) => response.data),

  status: (id) =>
    api.get(`/kits/${id}/status`).then((response) => response.data),

  get: (id) =>
    api.get(`/kits/${id}`).then((response) => response.data.kit),

  updateQuestions: (id, questions) =>
    api
      .patch(`/kits/${id}`, { questions })
      .then((response) => response.data.kit),

  regenerateQuestions: (id, category) =>
    api
      .post(`/kits/${id}/questions/regenerate`, { category })
      .then((response) => response.data),

  remove: (id) =>
    api.delete(`/kits/${id}`),
};