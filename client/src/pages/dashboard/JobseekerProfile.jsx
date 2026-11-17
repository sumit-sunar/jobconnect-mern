import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import { Save, X, Plus, User, Mail, Shield } from 'lucide-react';

export default function JobseekerProfile() {
  const { user, updateUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    headline: user?.profile?.headline || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    skills: user?.profile?.skills || [],
    resumeUrl: user?.profile?.resumeUrl || '',
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !form.skills.includes(skill)) {
        setForm((prev) => ({
          ...prev,
          skills: [...prev.skills, skill],
        }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        profile: {
          headline: form.headline,
          bio: form.bio,
          location: form.location,
          skills: form.skills,
          resumeUrl: form.resumeUrl,
        },
      };

      const res = await userApi.updateMyProfile(payload);

      // Update AuthContext user
      if (res.data) {
        updateUser(res.data);
      }

      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your personal information and professional details.
        </p>
      </div>

      {/* Read-only fields */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Shield className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="brand" size="sm">
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={User}
            />
            <Input
              label="Headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., San Francisco, CA"
          />

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell employers about yourself..."
              className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:border-brand-600 focus:ring-brand-500/20 resize-none"
            />
          </div>

          <Input
            label="Resume URL"
            name="resumeUrl"
            value={form.resumeUrl}
            onChange={handleChange}
            placeholder="https://example.com/my-resume.pdf"
          />
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-brand-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter"
                className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 pl-9 pr-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:border-brand-600 focus:ring-brand-500/20"
              />
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Press Enter to add a skill. Click × to remove.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
