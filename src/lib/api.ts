const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  localStorage.setItem('token', token);
}

function removeToken(): void {
  localStorage.removeItem('token');
}

interface ApiError extends Error {
  status?: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { ...options, headers };
  
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (opts.body && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, opts);

  if (!response.ok) {
    const error: ApiError = new Error('API request failed');
    error.status = response.status;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => ({}));
      (error as any).data = data;
    } else {
      // Response is not JSON (likely HTML error page)
      const text = await response.text().catch(() => 'Unknown error');
      (error as any).data = { error: 'Server returned non-JSON response', details: text.substring(0, 200) };
    }
    throw error;
  }

  return response.json();
}

export const api = {
  setToken,
  removeToken,
  getToken,

  login: (username: string, password: string) =>
    request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: { username, password } as any,
    }),

  signup: (data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    confirmpassword: string;
    mobilenumber: string;
  }) =>
    request<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: data as any,
    }),

  logout: () =>
    request<{ message: string }>('/api/logout', { method: 'POST' }),

  getProfile: () =>
    request<{
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      role: string;
    }>('/api/users/profile'),

  getAuctions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ auctions: any[]; categories: any[] }>(`/api/auctions${query}`);
  },

  getAuction: (id: string) =>
    request<{ auction: any; bids: any[] }>(`/api/auction/${id}`),

  createAuction: (data: FormData) =>
    request<{ message: string }>('/api/auction', {
      method: 'POST',
      body: data,
    }),

  placeBid: (auctionId: string, bidAmount: number) =>
    request<{ message: string }>(`/api/auction/${auctionId}/bid`, {
      method: 'POST',
      body: { bid_amount: bidAmount } as any,
    }),

  getAllUsers: () =>
    request<{ users: any[] }>('/api/admin/users'),

  promoteUser: (userId: string) =>
    request<{ message: string }>(`/api/admin/promote/${userId}`, {
      method: 'POST',
    }),

  closeAuction: (auctionId: string) =>
    request<{ message: string }>(`/api/admin/close-auction/${auctionId}`, {
      method: 'POST',
    }),

updateAuction: (auctionId: string, data: FormData) =>
     request<{ message: string }>(`/api/auction/${auctionId}`, {
       method: 'PUT',
       body: data,
     }),

  getUserBids: () =>
     request<{ bids: any[] }>('/api/user/bids'),
};

export type { ApiError };