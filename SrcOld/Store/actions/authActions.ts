import { createAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginSuccessPayload {
  user: User;
  token: string;
  refreshToken: string;
}

export const loginSuccess = createAction<LoginSuccessPayload>('auth/loginSuccess');
export const logout = createAction('auth/logout');
export const setToken = createAction<string>('auth/setToken');
export const setLoading = createAction<boolean>('auth/setLoading'); 