
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  profile: UserProfile | null;
  loading: boolean;
  requiredRole?: 'admin' | 'editor' | 'journalist';
}

export default function ProtectedRoute({ 
  children, 
  profile, 
  loading, 
  requiredRole 
}: ProtectedRouteProps) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-4xl font-black tracking-tighter text-black dark:text-white mb-4 animate-pulse">
          FCBK<span className="text-blue-600">FM</span>
        </div>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Vérification des autorisations...</p>
      </div>
    );
  }

  if (!profile) {
    // Redirect to login but save the current location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.role !== 'admin' && profile.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
