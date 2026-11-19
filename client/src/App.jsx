import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import BrowseJobsPage from './pages/BrowseJobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardRedirect from './pages/dashboard/DashboardRedirect';
import JobseekerOverview from './pages/dashboard/JobseekerOverview';
import JobseekerApplications from './pages/dashboard/JobseekerApplications';
import JobseekerProfile from './pages/dashboard/JobseekerProfile';
import EmployerOverview from './pages/dashboard/EmployerOverview';
import EmployerJobs from './pages/dashboard/EmployerJobs';
import EmployerJobForm from './pages/dashboard/EmployerJobForm';
import EmployerApplicants from './pages/dashboard/EmployerApplicants';
import AdminOverview from './pages/dashboard/AdminOverview';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminJobs from './pages/dashboard/AdminJobs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<BrowseJobsPage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected: /dashboard redirect */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardRedirect />} />
            </Route>

            {/* Jobseeker Dashboard */}
            <Route element={<ProtectedRoute roles={['jobseeker']} />}>
              <Route path="dashboard/jobseeker" element={<DashboardLayout />}>
                <Route index element={<JobseekerOverview />} />
                <Route path="applications" element={<JobseekerApplications />} />
                <Route path="profile" element={<JobseekerProfile />} />
              </Route>
            </Route>

            {/* Employer Dashboard */}
            <Route element={<ProtectedRoute roles={['employer']} />}>
              <Route path="dashboard/employer" element={<DashboardLayout />}>
                <Route index element={<EmployerOverview />} />
                <Route path="jobs" element={<EmployerJobs />} />
                <Route path="jobs/new" element={<EmployerJobForm />} />
                <Route path="jobs/:id/edit" element={<EmployerJobForm />} />
                <Route path="jobs/:id/applicants" element={<EmployerApplicants />} />
              </Route>
            </Route>

            {/* Admin Dashboard */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="dashboard/admin" element={<DashboardLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="jobs" element={<AdminJobs />} />
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
