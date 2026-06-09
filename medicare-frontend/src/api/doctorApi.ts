import api from './axios';
import { ApiResponse, Doctor, PaginatedResponse } from '../types';

export const getDoctors = async (params?: Record<string, unknown>): Promise<PaginatedResponse<Doctor>> => {
  const { data } = await api.get('/doctors', { params });
  return data;
};

export const createDoctor = async (payload: Record<string, unknown>): Promise<ApiResponse<{ doctor: Doctor }>> => {
  const { data } = await api.post('/doctors', payload);
  return data;
};

export const getDoctorById = async (id: string): Promise<ApiResponse<{ doctor: Doctor }>> => {
  const { data } = await api.get(`/doctors/${id}`);
  return data;
};

export const updateDoctor = async (id: string, payload: Record<string, unknown>): Promise<ApiResponse<{ doctor: Doctor }>> => {
  const { data } = await api.put(`/doctors/${id}`, payload);
  return data;
};

export const deleteDoctor = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`/doctors/${id}`);
  return data;
};

export const getDoctorAvailability = async (id: string, date: string): Promise<ApiResponse<{ available: boolean; workingHours: { start: string; end: string }; bookedSlots: { start_time: string; end_time: string }[] }>> => {
  const { data } = await api.get(`/doctors/${id}/availability`, { params: { date } });
  return data;
};
