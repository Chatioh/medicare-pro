import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import Button from '../components/ui/Button';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You do not have permission to access this page.
          Please contact your administrator if you think this is a mistake.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
