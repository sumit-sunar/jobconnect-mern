import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  Users,
} from 'lucide-react';

const jobseekerLinks = [
  { to: '/dashboard/jobseeker', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/jobseeker/applications', label: 'My Applications', icon: FileText },
  { to: '/dashboard/jobseeker/profile', label: 'Profile', icon: User },
];

const employerLinks = [
  { to: '/dashboard/employer', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/employer/jobs', label: 'My Jobs', icon: Briefcase },
];

const adminLinks = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: Users },
  { to: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
];

const getRoleVariant = (role) => {
  switch (role) {
    case 'employer':
      return 'purple';
    case 'admin':
      return 'warning';
    default:
      return 'brand';
  }
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  // Determine nav links based on role
  let navLinks = [];
  if (user.role === 'jobseeker') {
    navLinks = jobseekerLinks;
  } else if (user.role === 'employer') {
    navLinks = employerLinks;
  } else if (user.role === 'admin') {
    navLinks = adminLinks;
  }

  const handleLogout = () => {
    logout();
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-brand-50 text-brand-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const SidebarContent = () => (
    <>
      {/* User Pill */}
      <div className="p-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <Badge variant={getRoleVariant(user.role)} size="sm">
              {user.role.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            <link.icon className="w-4.5 h-4.5 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-150"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-900">{user.name}</span>
          <Badge variant={getRoleVariant(user.role)} size="sm">
            {user.role.toUpperCase()}
          </Badge>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200/80 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
