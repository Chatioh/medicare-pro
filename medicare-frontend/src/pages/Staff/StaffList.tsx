import { useState, useEffect } from 'react';
import { getAllStaff, createStaff, toggleStaffStatus, resetStaffPassword } from '../../api/staffApi';
import { User } from '../../types';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate } from '../../utils/formatters';
import { Search, UserPlus, UserX, UserCheck, KeyRound } from 'lucide-react';

const StaffList = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [staffToToggle, setStaffToToggle] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [staffToReset, setStaffToReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllStaff({ search: debouncedSearch, role: roleFilter });
      const rows = res?.data ?? res ?? [];
      setStaff(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [debouncedSearch, roleFilter]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'doctor': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'nurse': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'receptionist': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const validateAddForm = () => {
    const newErrors: Record<string, string> = {};
    if (!addForm.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!addForm.email.trim()) newErrors.email = 'Email is required';
    if (!addForm.password || addForm.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!addForm.role) newErrors.role = 'Role is required';
    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStaff = async () => {
    if (!validateAddForm()) return;
    setAdding(true);
    setAddError(null);
    try {
      await createStaff(addForm);
      setAddModalOpen(false);
      setAddForm({ full_name: '', email: '', password: '', role: 'receptionist' });
      setAddErrors({});
      fetchStaff();
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? 'Failed to create staff member');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!staffToToggle) return;
    setToggling(true);
    try {
      await toggleStaffStatus(staffToToggle.id);
      setToggleModalOpen(false);
      setStaffToToggle(null);
      fetchStaff();
    } catch (err: any) {
      console.error('Toggle status error:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleResetPassword = async () => {
    if (!staffToReset || !newPassword || newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      await resetStaffPassword(staffToReset.id, newPassword);
      setResetModalOpen(false);
      setStaffToReset(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err?.response?.data?.message ?? 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'full_name',
      header: 'Name',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.full_name as string}</span>
          <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate((row as any).createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-gray-500 dark:text-gray-400">{row.email as string}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(row.role as string)}`}>
          {(row.role as string).charAt(0).toUpperCase() + (row.role as string).slice(1)}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => {
        const active = row.is_active as boolean;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row) => <span>{formatDate((row as any).createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const u = row as unknown as User;
        if (u.role === 'admin') return null;
        return (
          <div className="flex gap-2">
            {u.is_active ? (
              <Button size="sm" variant="secondary" onClick={() => { setStaffToToggle(u); setToggleModalOpen(true); }}>
                <UserX className="w-4 h-4 mr-1" />
                Deactivate
              </Button>
            ) : (
              <Button size="sm" variant="success" onClick={() => { setStaffToToggle(u); setToggleModalOpen(true); }}>
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => { setStaffToReset(u); setResetModalOpen(true); }}>
              <KeyRound className="w-4 h-4 mr-1" />
              Reset Password
            </Button>
          </div>
        );
      },
    },
  ];

  const tableData: Record<string, unknown>[] = (staff ?? []).map((s) => ({ ...s }));

  return (
    <PageWrapper title="Staff Management">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <Button variant="primary" onClick={() => setAddModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {['admin', 'doctor', 'nurse', 'receptionist'].map((role) => (
              <div key={role} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(staff ?? []).filter((s) => s.role === role).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">{role}s</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap mb-4 items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {loading && staff.length === 0 ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No staff members found."
            />
          )}
        </div>
      </div>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Staff Member">
        <div className="p-6 space-y-4">
          <Input
            label="Full Name *"
            value={addForm.full_name}
            onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
            error={addErrors.full_name}
            placeholder="Enter full name"
          />
          <Input
            label="Email Address *"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            error={addErrors.email}
            placeholder="staff@medicare.com"
          />
          <Input
            label="Password *"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            error={addErrors.password}
            placeholder="Minimum 8 characters"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="receptionist">Receptionist</option>
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor (creates user account only — add doctor profile separately)</option>
            </select>
            {addErrors.role && <p className="text-red-500 text-xs mt-1">{addErrors.role}</p>}
          </div>
          {addError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {addError}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)} disabled={adding}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStaff} loading={adding}>Create Account</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={toggleModalOpen}
        onClose={() => setToggleModalOpen(false)}
        title={staffToToggle?.is_active ? 'Deactivate Staff Member' : 'Activate Staff Member'}
      >
        <div className="p-6 text-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${staffToToggle?.is_active ? 'bg-red-100' : 'bg-green-100'}`}>
            {staffToToggle?.is_active
              ? <UserX className="h-6 w-6 text-red-600" />
              : <UserCheck className="h-6 w-6 text-green-600" />
            }
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {staffToToggle?.is_active ? 'Deactivate' : 'Activate'} {staffToToggle?.full_name}?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {staffToToggle?.is_active
              ? 'This staff member will no longer be able to log in to the system.'
              : 'This staff member will be able to log in to the system again.'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setToggleModalOpen(false)} disabled={toggling}>Cancel</Button>
            <Button
              variant={staffToToggle?.is_active ? 'danger' : 'success'}
              onClick={handleToggleStatus}
              loading={toggling}
            >
              {staffToToggle?.is_active ? 'Yes, Deactivate' : 'Yes, Activate'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Password">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reset password for <span className="font-semibold text-gray-900 dark:text-gray-100">{staffToReset?.full_name}</span>
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Make sure to share the new password with the staff member securely after resetting.
            </p>
          </div>
          <Input
            label="New Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
          {resetError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {resetError}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)} disabled={resetting}>Cancel</Button>
            <Button variant="primary" onClick={handleResetPassword} loading={resetting}>Reset Password</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default StaffList;
