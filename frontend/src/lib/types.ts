export interface User {
  id?: number;
  email: string;
  name: string;
  subscriptionTier: string;
  generationsUsed: number;
  generationsLimit: number;
  brandVoice?: string;
  brandIndustry?: string;
  brandTargetAudience?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  subscriptionTier: string;
  generationsUsed: number;
  generationsLimit: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  subscriptionTier: string;
  generationsUsed: number;
  generationsLimit: number;
  brandVoice: string | null;
  brandIndustry: string | null;
  brandTargetAudience: string | null;
}

export interface DashboardStats {
  totalGenerations: number;
  generationsThisMonth: number;
  averageScore: number;
  subscriptionTier: string;
  generationsRemaining: number;
}

export interface Generation {
  id: number;
  contentType: string;
  platform: string;
  prompt: string;
  generatedContent: string;
  refinedContent?: string;
  score: number;
  feedback: string;
  wordCount: number;
  characterCount: number;
  bookmarked: boolean;
  createdAt: string;
}

export interface GenerateResponse {
  id: number;
  content: string;
  score: number;
  feedback: string;
  wordCount: number;
  characterCount: number;
  contentType: string;
  platform: string;
  createdAt: string;
}

export interface ScoreResponse {
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface Template {
  id: number;
  name: string;
  contentType: string;
  platform: string;
  systemPrompt: string;
  exampleOutput?: string;
  isPremium: boolean;
  usageCount: number;
  category: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BillingSession {
  sessionId: string;
  url: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
  status?: number;
}
