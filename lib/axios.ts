import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  isAccessTokenNearExpiry,
  clearTokens,
} from './token';

type PendingRequest = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

const RETRY_FLAG = '__axios_retry__' as const;
const REFRESH_ENDPOINT = '/api/auth/refresh';

type RetriableConfig = InternalAxiosRequestConfig & {
  [key in typeof RETRY_FLAG]?: boolean;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

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
  const value = `Bearer ${token}`;
  const headers = config.headers instanceof AxiosHeaders
    ? config.headers
    : AxiosHeaders.from(config.headers ?? {});

  headers.set('Authorization', value);
  config.headers = headers;
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    return waitForRefreshCompletion();
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    throw new Error('Missing refresh token');
  }

  isRefreshing = true;

  try {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = (await response.json()) as {
      accessToken?: string;
      expiresAt?: number;
    };

    if (!data.accessToken || typeof data.expiresAt !== 'number') {
      throw new Error('Invalid refresh response');
    }

    setTokens(data.accessToken, refreshToken, data.expiresAt);
    flushQueue();
  } catch (error) {
    flushQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return config;
    }

    if (isRefreshing) {
      await waitForRefreshCompletion();
    } else if (isAccessTokenNearExpiry(30)) {
      await refreshAccessToken();
    }

    const tokenToUse = getAccessToken();
    if (tokenToUse) {
      applyAuthorizationHeader(config, tokenToUse);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;

    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error);
    }

    const typedConfig = config as RetriableConfig;

    if (typedConfig[RETRY_FLAG]) {
      clearTokens();
      return Promise.reject(error);
    }

    typedConfig[RETRY_FLAG] = true;

    try {
      await refreshAccessToken();
      const latestToken = getAccessToken();
      if (latestToken) {
        applyAuthorizationHeader(typedConfig, latestToken);
      }
      return api.request(typedConfig);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
