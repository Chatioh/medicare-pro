import api from './axios';
import { ApiResponse, LoginResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getMe = async (): Promise<ApiResponse<{ user: User }>> => {
  const { data } = await api.get('/auth/me');
  return data;
};
