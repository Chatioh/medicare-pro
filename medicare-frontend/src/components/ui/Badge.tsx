interface BadgeProps {
  status: string;
}

const Badge = ({ status }: BadgeProps) => {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-orange-100 text-orange-700',
    issued: 'bg-purple-100 text-purple-700',
    dispensed: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-gray-100 text-gray-500',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
};

export default Badge;
