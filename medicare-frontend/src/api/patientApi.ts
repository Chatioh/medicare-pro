import api from './axios';
import { ApiResponse, MedicalHistory, PaginatedResponse, Patient } from '../types';

export const getPatients = async (params?: Record<string, unknown>): Promise<PaginatedResponse<Patient>> => {
  const { data } = await api.get('/patients', { params });
  return data;
};

export const createPatient = async (payload: Record<string, unknown>): Promise<ApiResponse<{ patient: Patient }>> => {
  const { data } = await api.post('/patients', payload);
  return data;
};

export const getPatientById = async (id: string): Promise<ApiResponse<{ patient: Patient }>> => {
  const { data } = await api.get(`/patients/${id}`);
  return data;
};

export const updatePatient = async (id: string, payload: Record<string, unknown>): Promise<ApiResponse<{ patient: Patient }>> => {
  const { data } = await api.put(`/patients/${id}`, payload);
  return data;
};

export const deletePatient = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`/patients/${id}`);
  return data;
};

export const getMedicalHistory = async (id: string): Promise<ApiResponse<{ medicalHistory: MedicalHistory }>> => {
  const { data } = await api.get(`/patients/${id}/history`);
  return data;
};

export const updateMedicalHistory = async (id: string, payload: Record<string, unknown>): Promise<ApiResponse<{ medicalHistory: MedicalHistory }>> => {
  const { data } = await api.put(`/patients/${id}/history`, payload);
  return data;
};
