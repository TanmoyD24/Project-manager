import apiClient from "./axiosSetup";

export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.post("/auth/current-user"),
  changePassword: (data) => apiClient.post("/auth/change-password", data),
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (token, data) => apiClient.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
  resendVerification: () => apiClient.post("/auth/resend-email-verification"),
  refreshToken: () => apiClient.post("/auth/refresh-Token"),
};

export const projectAPI = {
  getAll: () => apiClient.get("/projects"),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post("/projects", data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  getMembers: (projectId) => apiClient.get(`/projects/${projectId}/members`),
  addMember: (projectId, data) => apiClient.post(`/projects/${projectId}/members`, data),
  updateMemberRole: (projectId, userId, role) =>
    apiClient.put(`/projects/${projectId}/members/${userId}`, { role }),
  removeMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskAPI = {
  getByProject: (projectId) => apiClient.get(`/tasks/project/${projectId}`),
  getById: (taskId) => apiClient.get(`/tasks/${taskId}`),
  create: (projectId, data) => apiClient.post(`/tasks/project/${projectId}`, data),
  update: (taskId, data) => apiClient.put(`/tasks/${taskId}`, data),
  delete: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  createSubTask: (taskId, data) => apiClient.post(`/tasks/${taskId}/subtasks`, data),
  updateSubTask: (subTaskId, data) => apiClient.put(`/tasks/subtasks/${subTaskId}`, data),
  deleteSubTask: (subTaskId) => apiClient.delete(`/tasks/subtasks/${subTaskId}`),
};

export default apiClient;