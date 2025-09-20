import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  getExpiresAt,
  setTokens,
  isAccessTokenNearExpiry,
  clearTokens,
} from './token';

type PendingRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const RETRY_FLAG = '_retry';
const REFRESH_ENDPOINT = '/api/auth/refresh';

function waitForRefreshCompletion(): Promise<void> {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });
}

function flushQueue(error?: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  pendingQueue = [];
}

function applyAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
  const headerValue = `Bearer ${token}`;

  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', headerValue);
    return;
  }

  config.headers = {
    ...(config.headers ?? {}),
    Authorization: headerValue,
  };
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    return waitForRefreshCompletion();
  }

  isRefreshing = true;
  const refreshToken = getRefreshToken();
  const expiresAt = getExpiresAt();

  try {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken, expiresAt }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    };

    const nextAccessToken = data.accessToken;
    const nextExpiresAt = data.expiresAt;
    const nextRefreshToken = data.refreshToken ?? refreshToken;

    if (!nextAccessToken || typeof nextExpiresAt !== 'number' || !nextRefreshToken) {
      throw new Error('Invalid refresh token response');
    }

    setTokens(nextAccessToken, nextRefreshToken, nextExpiresAt);
    flushQueue();
  } catch (error) {
    flushQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return config;
    }

    if (isRefreshing) {
      await waitForRefreshCompletion();
    } else if (isAccessTokenNearExpiry(30)) {
      await refreshAccessToken();
    }

    const latestToken = getAccessToken();
    if (latestToken) {
      applyAuthorizationHeader(config, latestToken);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalConfig = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalConfig || originalConfig[RETRY_FLAG]) {
      clearTokens();
      return Promise.reject(error);
    }

    originalConfig[RETRY_FLAG] = true;

    try {
      await refreshAccessToken();

      const latestToken = getAccessToken();
      if (latestToken) {
        applyAuthorizationHeader(originalConfig, latestToken);
      }

      return api.request(originalConfig);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
