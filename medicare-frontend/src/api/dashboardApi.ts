import api from './axios';
import { ApiResponse, Appointment, DashboardStats, Patient } from '../types';

export const getStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getAppointmentsToday = async (): Promise<ApiResponse<{ appointments: Appointment[] }>> => {
  const { data } = await api.get('/dashboard/appointments-today');
  return data;
};

export const getRecentPatients = async (): Promise<ApiResponse<{ patients: Patient[] }>> => {
  const { data } = await api.get('/dashboard/recent-patients');
  return data;
};
