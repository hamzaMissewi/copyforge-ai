import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),
  me: () => api.get("/api/auth/me"),
};

export const generateAPI = {
  generate: (data: {
    contentType: string;
    platform: string;
    prompt: string;
    tone?: string;
    wordLimit?: number;
    templateId?: number;
  }) => api.post("/api/generate", data),
  refine: (content: string, instruction: string) =>
    api.post("/api/generate/refine", { content, instruction }),
  score: (content: string, platform?: string, contentType?: string) =>
    api.post("/api/generate/score", { content, platform, contentType }),
  history: (page = 0, size = 10, contentType?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (contentType) params.append("contentType", contentType);
    return api.get(`/api/generate/history?${params}`);
  },
  recent: () => api.get("/api/generate/recent"),
  bookmarks: (page = 0, size = 10) =>
    api.get(`/api/generate/bookmarks?page=${page}&size=${size}`),
  toggleBookmark: (id: number) => api.patch(`/api/generate/${id}/bookmark`),
  delete: (id: number) => api.delete(`/api/generate/${id}`),
};

export const templateAPI = {
  getAll: () => api.get("/api/templates"),
  getById: (id: number) => api.get(`/api/templates/${id}`),
  getByType: (contentType: string) => api.get(`/api/templates/type/${contentType}`),
  getByCategory: (category: string) => api.get(`/api/templates/category/${category}`),
};

export const userAPI = {
  profile: () => api.get("/api/user/profile"),
  updateBrand: (data: { brandVoice?: string; brandIndustry?: string; brandTargetAudience?: string }) =>
    api.put("/api/user/brand", data),
  dashboard: () => api.get("/api/user/dashboard"),
};

export default api;
