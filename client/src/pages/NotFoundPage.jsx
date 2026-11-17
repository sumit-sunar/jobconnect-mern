import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto my-auto px-4 py-24 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-brand-50 text-brand-600 mb-6 shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Button to="/" variant="primary" icon={ArrowLeft}>
        Return to Home
      </Button>
    </div>
  );
}
