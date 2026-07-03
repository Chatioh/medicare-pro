import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CheckCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">MediCare Pro</span>
          </div>
          <h2 className="mt-16 text-4xl font-bold text-white leading-tight">
            Modern Healthcare<br />Management
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            Streamline your practice with our comprehensive management platform.
          </p>
          <div className="mt-10 space-y-4">
            {['Patient records management', 'Appointment scheduling & tracking', 'Prescription & inventory control'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm">&copy; 2025 MediCare Pro. All rights reserved.</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">MediCare Pro</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account to continue.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-800">{error}</div>}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@hospital.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
