import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, Search, Plus, Edit2, Trash2, Mail, Phone, Shield, UserCheck, RefreshCw, X, ShieldAlert, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import type { RootState } from '../../store/store';
import toast, { Toaster } from 'react-hot-toast';
import ImageUpload from '../../components/cms/ImageUpload';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phone?: string;
  profileImage?: string;
  department?: string;
  designation?: string;
  status: 'Active' | 'Inactive';
  permissions: Record<string, string[]>;
}

const MODULE_ACTIONS: Record<string, string[]> = {
  products: ['view', 'create', 'edit', 'delete', 'archive'],
  categories: ['view', 'create', 'edit', 'delete'],
  orders: ['view', 'update', 'assign', 'export'],
  crm: ['view', 'create', 'edit', 'delete', 'assign', 'export'],
  quotations: ['view', 'create', 'edit', 'approve', 'export'],
  employees: ['view', 'create', 'edit', 'delete'],
  reports: ['view', 'export'],
  cms: ['view', 'create', 'edit', 'delete'],
  expenses: ['view', 'create', 'delete'],
  dashboard: ['view'],
};

const MODULE_LABELS: Record<string, string> = {
  products: 'Products',
  categories: 'Categories',
  orders: 'Bookings & Orders',
  crm: 'CRM (Leads & Contacts)',
  quotations: 'Quotations',
  employees: 'Employees',
  reports: 'Reports & Analytics',
  cms: 'Website CMS',
  expenses: 'Expenses',
  dashboard: 'Dashboard View',
};

const EmployeesList = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [modalTab, setModalTab] = useState<'general' | 'permissions'>('general');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('STAFF');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users');
      setEmployees(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    setProfileImage('');
    setDepartment('');
    setDesignation('');
    setRole('STAFF');
    setStatus('Active');
    setPassword('');
    
    // Initialize permissions with view permission for dashboard/crm by default
    const initialPerms: Record<string, string[]> = {};
    Object.keys(MODULE_ACTIONS).forEach((mod) => {
      initialPerms[mod] = mod === 'dashboard' || mod === 'crm' ? ['view'] : [];
    });
    setPermissions(initialPerms);
    
    setModalTab('general');
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setProfileImage(emp.profileImage || '');
    setDepartment(emp.department || '');
    setDesignation(emp.designation || '');
    setRole(emp.role);
    setStatus(emp.status);
    setPassword('');
    
    // Fill in permissions
    const empPerms = { ...emp.permissions };
    Object.keys(MODULE_ACTIONS).forEach((mod) => {
      if (!empPerms[mod]) {
        empPerms[mod] = [];
      }
    });
    setPermissions(empPerms);
    
    setModalTab('general');
    setModalOpen(true);
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setPermissions((prev) => {
      const modPerms = prev[module] ? [...prev[module]] : [];
      if (checked) {
        if (!modPerms.includes(action)) {
          modPerms.push(action);
        }
      } else {
        const idx = modPerms.indexOf(action);
        if (idx > -1) {
          modPerms.splice(idx, 1);
        }
      }
      return {
        ...prev,
        [module]: modPerms,
      };
    });
  };

  const toggleAllModulePermissions = (module: string, selectAll: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: selectAll ? [...MODULE_ACTIONS[module]] : [],
    }));
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      name,
      email,
      phone,
      profileImage,
      department,
      designation,
      role,
      status,
      permissions,
      ...(password ? { password } : {}),
    };

    try {
      if (editingEmployee) {
        const { data } = await api.put(`/users/${editingEmployee._id}`, payload);
        toast.success('Employee updated successfully');
        setEmployees(prev => prev.map(emp => emp._id === editingEmployee._id ? data : emp));
      } else {
        const { data } = await api.post('/users', payload);
        toast.success('Employee created & invitation sent!');
        setEmployees(prev => [data, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee deleted successfully');
      setEmployees(prev => prev.filter(emp => emp._id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Filter Employees List
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = !roleFilter || emp.role === roleFilter;
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    const matchesDept = !deptFilter || emp.department === deptFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  // Unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(employees.map(emp => emp.department).filter(Boolean))
  ) as string[];

  // Helper to check standard human-friendly permission label
  const getActionLabel = (act: string) => {
    if (act === 'update') return 'Edit';
    return act.charAt(0).toUpperCase() + act.slice(1);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 selection:bg-amber-500 selection:text-black">
      <Toaster />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-amber-500" />
            Employee Management
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Manage your CRM panel staff, credentials, and module-level actions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-colors self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, email or title..."
            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-750 dark:text-zinc-350 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-750 dark:text-zinc-350 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-750 dark:text-zinc-350 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-colors overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm text-zinc-500">Loading staff database...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No employees matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-4 px-6">ID & Photo</th>
                  <th className="py-4 px-6">Name & Designation</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Role & Dept</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/60 text-xs">
                {filteredEmployees.map((emp) => {
                  const isSelf = currentUser?._id === emp._id;
                  const isSuperAdmin = emp.role === 'SUPER_ADMIN';

                  return (
                    <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-zinc-850/40 text-gray-700 dark:text-zinc-300">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-bold shrink-0">
                            {emp.profileImage ? (
                              <img src={emp.profileImage} alt={emp.name} className="h-full w-full object-cover" />
                            ) : (
                              emp.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-mono font-semibold text-zinc-500">
                            {emp.employeeId || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-950 dark:text-white text-sm">{emp.name}</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">{emp.designation || 'Staff Member'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <Mail size={12} />
                          <span>{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                            <Phone size={12} />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isSuperAdmin
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : emp.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-450'
                          }`}>
                            <Shield size={10} />
                            {emp.role === 'SUPER_ADMIN' ? 'Super Admin' : emp.role}
                          </span>
                          {emp.department && (
                            <p className="text-zinc-400 text-[10px] pl-1">{emp.department}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-gray-950 dark:hover:text-white transition-colors"
                            title="Edit Employee & Permissions"
                          >
                            <Edit2 size={14} />
                          </button>
                          {!isSelf && !isSuperAdmin && currentUser?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteConfirmId(emp._id)}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">Delete Staff Member?</h4>
              <p className="text-zinc-400 text-xs">
                This action is permanent. The user will be immediately logged out and deleted from the database.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900/60">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {editingEmployee ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {editingEmployee ? `Modifying profile: ${editingEmployee.email}` : 'Add details and assign custom permissions.'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 px-5 gap-4">
              <button
                onClick={() => setModalTab('general')}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  modalTab === 'general'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                General Details
              </button>
              <button
                onClick={() => setModalTab('permissions')}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  modalTab === 'permissions'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                Permissions Matrix
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEmployee} className="flex-1 overflow-y-auto flex flex-col">
              
              {/* Tab Panel 1: General */}
              {modalTab === 'general' && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <ImageUpload
                        label="Avatar Image"
                        value={profileImage}
                        onChange={setProfileImage}
                        aspectRatio="aspect-square"
                        placeholder="Avatar photo"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={!!editingEmployee}
                          placeholder="e.g. rahul@gabha.in"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Password
                        </label>
                        <input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={editingEmployee ? "Leave blank to keep unchanged" : "Leave blank to auto-generate"}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Sales, Marketing"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. Account Executive"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Role Selection
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="STAFF">Staff</option>
                          <option value="ADMIN">Admin</option>
                          {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-gray-950 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Panel 2: Permissions */}
              {modalTab === 'permissions' && (
                <div className="p-6 space-y-4">
                  {role === 'SUPER_ADMIN' ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
                      <Shield size={16} />
                      Super Admin automatically possesses all permissions. Checkboxes are disabled.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b dark:border-zinc-800">
                        <p className="text-[11px] text-zinc-400 font-medium">
                          Customize access permissions. View permission is required to access modules.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {Object.keys(MODULE_ACTIONS).map((module) => {
                          const actions = MODULE_ACTIONS[module];
                          const selectedActions = permissions[module] || [];
                          const isAllSelected = actions.every((act) => selectedActions.includes(act));

                          return (
                            <div key={module} className="border border-gray-150 dark:border-zinc-800/80 rounded-xl p-4 bg-gray-50 dark:bg-zinc-900/30">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-xs text-gray-950 dark:text-white">
                                  {MODULE_LABELS[module]}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleAllModulePermissions(module, !isAllSelected)}
                                  className="text-[10px] font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors"
                                >
                                  {isAllSelected ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-x-5 gap-y-2">
                                {actions.map((act) => {
                                  const isChecked = selectedActions.includes(act);

                                  return (
                                    <label key={act} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-zinc-300">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handlePermissionChange(module, act, e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-transparent dark:border-zinc-700"
                                      />
                                      <span>{getActionLabel(act)}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 flex items-center justify-end gap-3 mt-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  {submitLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save Employee
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeesList;
