import { useEffect, useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { getStats, getAppointmentsToday, getRecentPatients } from '../api/dashboardApi';
import { DashboardStats, Appointment, Patient } from '../types';
import { Users, Stethoscope, CalendarCheck, Pill, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, apptsRes, patientsRes] = await Promise.all([
          getStats(),
          getAppointmentsToday(),
          getRecentPatients(),
        ]);
        setStats(statsRes.data as DashboardStats);
        setTodayAppts(apptsRes.data.appointments);
        setRecentPatients(patientsRes.data.patients);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <Spinner />
      </PageWrapper>
    );
  }

  const statCards = [
    { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: 'bg-green-50 text-green-600' },
    { label: "Today's Appointments", value: stats?.appointmentsToday ?? 0, icon: CalendarCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Prescriptions', value: stats?.activePrescriptions ?? 0, icon: Pill, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Today's Appointments">
          {todayAppts.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-4 text-center">No appointments today.</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.slice(0, 6).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{apt.patient?.full_name || '—'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {apt.start_time} — {apt.end_time}
                    </p>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent Patients">
          {recentPatients.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-4 text-center">No patients registered yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.patient_number}</p>
                  </div>
                  <Activity className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
