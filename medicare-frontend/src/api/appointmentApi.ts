import api from './axios';
import { ApiResponse, Appointment, PaginatedResponse } from '../types';

export const getAppointments = async (params?: Record<string, unknown>): Promise<PaginatedResponse<Appointment>> => {
  const { data } = await api.get('/appointments', { params });
  return data;
};

export const createAppointment = async (payload: Record<string, unknown>): Promise<ApiResponse<{ appointment: Appointment }>> => {
  const { data } = await api.post('/appointments', payload);
  return data;
};

export const getAppointmentById = async (id: string): Promise<ApiResponse<{ appointment: Appointment }>> => {
  const { data } = await api.get(`/appointments/${id}`);
  return data;
};

export const updateAppointment = async (id: string, payload: Record<string, unknown>): Promise<ApiResponse<{ appointment: Appointment }>> => {
  const { data } = await api.put(`/appointments/${id}`, payload);
  return data;
};

export const cancelAppointment = async (id: string): Promise<ApiResponse<{ appointment: Appointment }>> => {
  const { data } = await api.delete(`/appointments/${id}`);
  return data;
};

export const checkConflict = async (params: Record<string, string>): Promise<ApiResponse<{ available: boolean; conflictingAppointment: Appointment | null }>> => {
  const { data } = await api.get('/appointments/check-conflict', { params });
  return data;
};
