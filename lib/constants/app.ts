/**
 * Constantes globales de la aplicación
 */
export const APP_CONSTANTS = {
  AUTH: {
    COUNTDOWN_SECONDS: 20,
    VALIDATION_TOKEN: process.env.NEXT_PUBLIC_VALIDATION_TOKEN || '123456',
    TOKEN_EXPIRY_THRESHOLD_SEC: 30,
    DATA_VISIBILITY_TIMEOUT_MS: 30_000,
  },
  ROUTES: {
    PROTECTED: ['/dashboard', '/cards', '/transactions'],
    PUBLIC: ['/login', '/'],
  },
  CARD: {
    MAX_WIDTH: '14cm',
    ASPECT_RATIO: '8.5 / 5.5',
  },
} as const;

export type AppConstants = typeof APP_CONSTANTS;
