interface BadgeProps {
  status: string;
}

const Badge = ({ status }: BadgeProps) => {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    no_show: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    issued: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    dispensed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    expired: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
      {label}
    </span>
  );
};

export default Badge;
