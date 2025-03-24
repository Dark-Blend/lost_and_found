import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

export function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isLoading } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === 'admin';

    if (!currentUser && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (currentUser && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/');
    } else if (currentUser && inAdminGroup && currentUser.role !== 'admin') {
      // Redirect to home if not admin and trying to access admin pages
      router.replace('/');
    }
  }, [currentUser, segments, isLoading]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return null; // Or an unauthorized message
  }

  return children;
} 