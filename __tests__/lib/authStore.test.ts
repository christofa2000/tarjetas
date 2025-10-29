import api from '@/lib/api/client';
import useAuthStore from '@/lib/auth/store';
import * as tokenModule from '@/lib/auth/token';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mock axios
jest.mock('@/lib/api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock token module
jest.mock('@/lib/auth/token', () => ({
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  loadTokensFromStorage: jest.fn(),
}));

const mockedApi = api as { post: jest.MockedFunction<typeof api.post> };
const mockedToken = tokenModule as {
  setTokens: jest.MockedFunction<typeof tokenModule.setTokens>;
  clearTokens: jest.MockedFunction<typeof tokenModule.clearTokens>;
  loadTokensFromStorage: jest.MockedFunction<typeof tokenModule.loadTokensFromStorage>;
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store antes de cada test
    useAuthStore.setState({
      user: null,
    });

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockResponse = {
        data: {
          user: mockUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() / 1000 + 180,
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });

      expect(mockedToken.setTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
        expect.any(Number)
      );
    });

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockedApi.post.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong');
        } catch (error) {
          // Expected to throw
          expect(error).toBeInstanceOf(Error);
        }
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(mockedToken.setTokens).not.toHaveBeenCalled();
    });

    it('should throw error for invalid login response', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          user: null,
          accessToken: 'token',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Invalid login response');
        }
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Set initial user
      useAuthStore.setState({
        user: { id: '1', name: 'Test', email: 'test@test.com' },
      });

      mockedApi.post.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(mockedToken.clearTokens).toHaveBeenCalled();
    });

    it('should clear user even if logout API fails', async () => {
      useAuthStore.setState({
        user: { id: '1', name: 'Test', email: 'test@test.com' },
      });

      const error = new Error('API Error');
      mockedApi.post.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.logout();
        } catch {
          // El error se espera aquí, pero el logout debe continuar
        }
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(mockedToken.clearTokens).toHaveBeenCalled();
    });
  });
});
