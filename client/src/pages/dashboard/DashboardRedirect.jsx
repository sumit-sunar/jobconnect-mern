import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * /dashboard → redirects to the role-specific dashboard
 */
export default function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const rolePathMap = {
    jobseeker: '/dashboard/jobseeker',
    employer: '/dashboard/employer',
    admin: '/dashboard/admin',
  };

  const targetPath = rolePathMap[user.role] || '/';
  return <Navigate to={targetPath} replace />;
}
