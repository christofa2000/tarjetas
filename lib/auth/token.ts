let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _expiresAt: number | null = null;

const STORAGE_KEYS = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresAt: 'exp',
} as const;

const hasWindow = typeof window !== 'undefined';

export function setTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  _expiresAt = expiresAt;

  if (!hasWindow) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    window.localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
  } catch {
    /* ignore storage errors */
  }
}

export function loadTokensFromStorage(): void {
  if (!hasWindow) {
    return;
  }

  try {
    const storedAccess = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    const storedRefresh = window.localStorage.getItem(STORAGE_KEYS.refreshToken);
    const storedExpires = window.localStorage.getItem(STORAGE_KEYS.expiresAt);

    _accessToken = storedAccess;
    _refreshToken = storedRefresh;
    _expiresAt = storedExpires ? Number.parseInt(storedExpires, 10) || null : null;
  } catch {
    _accessToken = null;
    _refreshToken = null;
    _expiresAt = null;
  }
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getRefreshToken(): string | null {
  return _refreshToken;
}

export function getExpiresAt(): number | null {
  return _expiresAt;
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
  _expiresAt = null;

  if (!hasWindow) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    window.localStorage.removeItem(STORAGE_KEYS.expiresAt);
  } catch {
    /* ignore storage errors */
  }
}

export function isAccessTokenNearExpiry(thresholdSec = 30): boolean {
  if (_expiresAt == null) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return _expiresAt - now <= thresholdSec;
}
