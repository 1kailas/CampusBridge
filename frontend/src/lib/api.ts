const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('placement_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('placement_token') || '';
}

// In-memory client cache for lightning-fast (0ms) route transitions
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, maxAgeMs: number): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
  } else {
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  }
}

export const api = {
  // Auth
  async demoLogin() {
    clearApiCache();
    const res = await fetch(`${API_BASE_URL}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to login as demo user');
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('placement_token', data.token);
      localStorage.setItem('placement_user', JSON.stringify(data.user));
    }
    return data;
  },

  async demoAdminLogin() {
    clearApiCache();
    const res = await fetch(`${API_BASE_URL}/auth/demo-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to login as admin');
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('placement_token', data.token);
      localStorage.setItem('placement_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password?: string) {
    clearApiCache();
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('placement_token', data.token);
      localStorage.setItem('placement_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(body: any) {
    clearApiCache();
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('placement_token', data.token);
      localStorage.setItem('placement_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    clearApiCache();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('placement_token');
      localStorage.removeItem('placement_user');
    }
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    try {
      const u = localStorage.getItem('placement_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateProfile(data: any) {
    clearApiCache('profile');
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const updated = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('placement_user', JSON.stringify(updated));
    }
    return updated;
  },

  // Problems
  async getProblems(filters: Record<string, string> = {}) {
    const query = new URLSearchParams(filters).toString();
    const cacheKey = `problems:${query}:${getAuthToken()}`;
    const cached = getCached<any[]>(cacheKey, 20000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/problems?${query}`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch problems');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getProblemMetadata() {
    const cacheKey = 'problems:metadata';
    const cached = getCached<any>(cacheKey, 60000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/problems/meta`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch metadata');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getProblemBySlug(slug: string) {
    const cacheKey = `problem:${slug}:${getAuthToken()}`;
    const cached = getCached<any>(cacheKey, 20000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/problems/${slug}`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Problem not found');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async saveProblemNote(problemId: string, content: string) {
    clearApiCache('problem:');
    const res = await fetch(`${API_BASE_URL}/problems/${problemId}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to save note');
    return res.json();
  },

  async createProblem(data: any) {
    clearApiCache('problems');
    clearApiCache('problem');
    clearApiCache('sheets');
    const res = await fetch(`${API_BASE_URL}/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create problem');
    }
    return res.json();
  },

  async deleteProblem(id: string) {
    clearApiCache('problems');
    clearApiCache('problem');
    clearApiCache('sheets');
    const res = await fetch(`${API_BASE_URL}/problems/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete problem');
    }
    return res.json();
  },

  // Execution & Submissions
  async runCode(problemId: string, language: string, code: string, customInput?: string) {
    const res = await fetch(`${API_BASE_URL}/submissions/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problemId, language, code, customInput }),
    });
    if (!res.ok) throw new Error('Code execution failed');
    return res.json();
  },

  async submitCode(problemId: string, language: string, code: string) {
    clearApiCache('problems');
    clearApiCache('problem');
    clearApiCache('stats');
    clearApiCache('leaderboard');
    const res = await fetch(`${API_BASE_URL}/submissions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problemId, language, code }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Submission failed');
    }
    return res.json();
  },

  async getProblemSubmissions(problemId: string) {
    const res = await fetch(`${API_BASE_URL}/submissions/problem/${problemId}`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getUserSubmissions() {
    const res = await fetch(`${API_BASE_URL}/submissions/user/history`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Sheets
  async getSheets() {
    const cacheKey = `sheets:${getAuthToken()}`;
    const cached = getCached<any[]>(cacheKey, 60000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/sheets`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch sheets');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getSheetBySlug(slug: string) {
    const cacheKey = `sheet:${slug}:${getAuthToken()}`;
    const cached = getCached<any>(cacheKey, 60000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/sheets/${slug}`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch sheet');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  // Assessments
  async getAssessments() {
    const cacheKey = `assessments:${getAuthToken()}`;
    const cached = getCached<any[]>(cacheKey, 30000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/assessments`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch assessments');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getAssessmentById(id: string) {
    const cacheKey = `assessment:${id}:${getAuthToken()}`;
    const cached = getCached<any>(cacheKey, 30000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch assessment');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async startAssessment(id: string) {
    const res = await fetch(`${API_BASE_URL}/assessments/${id}/start`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to start assessment');
    return res.json();
  },

  async submitAssessment(attemptId: string, problemScores: any[]) {
    clearApiCache('assessments');
    clearApiCache('stats');
    clearApiCache('leaderboard');
    const res = await fetch(`${API_BASE_URL}/assessments/${attemptId}/submit-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problemScores }),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // Stats & Leaderboard
  async getMyStats() {
    const cacheKey = `stats:me:${getAuthToken()}`;
    const cached = getCached<any>(cacheKey, 15000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/stats/me`, {
      headers: { ...getAuthHeader() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getLeaderboard() {
    const cacheKey = 'stats:leaderboard';
    const cached = getCached<any[]>(cacheKey, 15000);
    if (cached) return cached;

    const res = await fetch(`${API_BASE_URL}/stats/leaderboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },
};
