import axios from "axios";
import type { AuthResponse, UserProfile, DashboardStats, Generation, GenerateResponse, ScoreResponse, Template, PaginatedResponse, BillingSession } from "./types";

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
    api.post<AuthResponse>("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/register", { name, email, password }),
  me: () => api.get<AuthResponse>("/api/auth/me"),
};

export const generateAPI = {
  generate: (data: {
    contentType: string;
    platform: string;
    prompt: string;
    tone?: string;
    wordLimit?: number;
    templateId?: number;
  }) => api.post<GenerateResponse>("/api/generate", data),
  refine: (content: string, instruction: string) =>
    api.post<{ content: string }>("/api/generate/refine", { content, instruction }),
  score: (content: string, platform?: string, contentType?: string) =>
    api.post<ScoreResponse>("/api/generate/score", { content, platform, contentType }),
  history: (page = 0, size = 10, contentType?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (contentType) params.append("contentType", contentType);
    return api.get<PaginatedResponse<Generation>>(`/api/generate/history?${params}`);
  },
  recent: () => api.get<Generation[]>("/api/generate/recent"),
  bookmarks: (page = 0, size = 10) =>
    api.get<PaginatedResponse<Generation>>(`/api/generate/bookmarks?page=${page}&size=${size}`),
  toggleBookmark: (id: number) => api.patch<{ bookmarked: boolean }>(`/api/generate/${id}/bookmark`),
  delete: (id: number) => api.delete<{ message: string }>(`/api/generate/${id}`),
};

export const templateAPI = {
  getAll: () => api.get<Template[]>("/api/templates"),
  getById: (id: number) => api.get<Template>(`/api/templates/${id}`),
  getByType: (contentType: string) => api.get<Template[]>(`/api/templates/type/${contentType}`),
  getByCategory: (category: string) => api.get<Template[]>(`/api/templates/category/${category}`),
};

export const userAPI = {
  profile: () => api.get<UserProfile>("/api/user/profile"),
  updateBrand: (data: { brandVoice?: string; brandIndustry?: string; brandTargetAudience?: string }) =>
    api.put<{ message: string }>("/api/user/brand", data),
  dashboard: () => api.get<DashboardStats>("/api/user/dashboard"),
};

export const billingAPI = {
  checkout: (priceId: string) =>
    api.post<BillingSession>("/api/billing/checkout", { priceId }),
  portal: () => api.get<{ url: string }>("/api/billing/portal"),
};

export default api;
