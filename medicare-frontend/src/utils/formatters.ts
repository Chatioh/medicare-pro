export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '—';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return '—';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-yellow-100 text-yellow-800',
    issued: 'bg-purple-100 text-purple-800',
    dispensed: 'bg-green-100 text-green-800',
    expired: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const calculateAge = (dob: string): number => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
