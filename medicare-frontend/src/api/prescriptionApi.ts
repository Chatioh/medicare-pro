import api from './axios';
import { ApiResponse, PaginatedResponse, Prescription } from '../types';

export const getPrescriptions = async (params?: Record<string, unknown>): Promise<PaginatedResponse<Prescription>> => {
  const { data } = await api.get('/prescriptions', { params });
  return data;
};

export const createPrescription = async (payload: Record<string, unknown>): Promise<ApiResponse<{ prescription: Prescription }>> => {
  const { data } = await api.post('/prescriptions', payload);
  return data;
};

export const getPrescriptionById = async (id: string): Promise<ApiResponse<{ prescription: Prescription }>> => {
  const { data } = await api.get(`/prescriptions/${id}`);
  return data;
};

export const dispensePrescription = async (id: string): Promise<ApiResponse<{ prescription: Prescription }>> => {
  const { data } = await api.put(`/prescriptions/${id}/dispense`);
  return data;
};

export const cancelPrescription = async (id: string): Promise<ApiResponse<{ prescription: Prescription }>> => {
  const { data } = await api.put(`/prescriptions/${id}/cancel`);
  return data;
};
