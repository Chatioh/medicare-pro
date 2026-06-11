import api from './axios';

export const getAllStaff = async (params?: any) => {
  const response = await api.get('/auth/staff', { params });
  return response.data;
};

export const createStaff = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const toggleStaffStatus = async (id: string) => {
  const response = await api.patch(`/auth/staff/${id}/toggle-status`);
  return response.data;
};

export const resetStaffPassword = async (id: string, newPassword: string) => {
  const response = await api.patch(`/auth/staff/${id}/reset-password`, { newPassword });
  return response.data;
};
