import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Briefcase, Menu, X, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-brand-600 font-semibold'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Job<span className="text-brand-600">Connect</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/jobs" className={navLinkClasses}>
              Browse Jobs
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 text-sm font-medium"
                >
                  <div className="w-6 h-6 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                  title="Sign out"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  to="/login"
                  variant="ghost"
                  size="md"
                >
                  Sign In
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  size="md"
                  icon={PlusCircle}
                >
                  Post a Job / Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={mobileNavLinkClasses}
              end
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/jobs"
              className={mobileNavLinkClasses}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Jobs
            </NavLink>
            {user && (
              <NavLink
                to="/dashboard"
                className={mobileNavLinkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-slate-50 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{user.name}</span>
                  <span className="text-xs text-brand-600 font-semibold capitalize">{user.role}</span>
                </div>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  to="/login"
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  className="w-full justify-center"
                  icon={PlusCircle}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
