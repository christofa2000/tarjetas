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

const REFRESH_ENDPOINT = '/api/auth/refresh';
const RETRY_FLAG = '_retry';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  pendingQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
      return;
    }

    prom.resolve(token);
  });

  pendingQueue = [];
};

function waitForRefreshCompletion(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });
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

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    const result = await waitForRefreshCompletion();
    if (typeof result === 'string') {
      return result;
    }

    const latestToken = getAccessToken();
    if (!latestToken) {
      throw new Error('Missing access token after refresh completion');
    }

    return latestToken;
  }

  isRefreshing = true;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    const error = new Error('Missing refresh token');
    processQueue(error);
    clearTokens();
    isRefreshing = false;
    throw error;
  }

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
      refreshToken?: string;
      expiresAt?: number;
    };

    const nextAccessToken = data.accessToken;
    const nextRefreshToken = data.refreshToken ?? refreshToken;
    const nextExpiresAt =
      typeof data.expiresAt === 'number' ? data.expiresAt : getExpiresAt();

    if (
      !nextAccessToken ||
      typeof nextExpiresAt !== 'number' ||
      Number.isNaN(nextExpiresAt) ||
      !nextRefreshToken
    ) {
      throw new Error('Invalid refresh token response');
    }

    setTokens(nextAccessToken, nextRefreshToken, nextExpiresAt);
    processQueue(null, nextAccessToken);
    return nextAccessToken;
  } catch (unknownError) {
    const error =
      unknownError instanceof Error ? unknownError : new Error('Failed to refresh access token');
    processQueue(error);
    clearTokens();
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

    const originalConfig = error.config as
      | (InternalAxiosRequestConfig & { [RETRY_FLAG]?: boolean })
      | undefined;

    if (!originalConfig || originalConfig[RETRY_FLAG]) {
      clearTokens();
      return Promise.reject(error);
    }

    if (originalConfig.url?.includes(REFRESH_ENDPOINT)) {
      clearTokens();
      return Promise.reject(error);
    }

    originalConfig[RETRY_FLAG] = true;

    try {
      const latestToken = await refreshAccessToken();
      applyAuthorizationHeader(originalConfig, latestToken);
      return api.request(originalConfig);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
