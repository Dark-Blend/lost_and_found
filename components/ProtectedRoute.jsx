import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import { View, ActivityIndicator } from 'react-native';

export function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isLoading } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === 'admin';

    console.log('ProtectedRoute Check:', {
      currentUser: currentUser?.email,
      userRole: currentUser?.role,
      inAuthGroup,
      inAdminGroup,
      segments,
      requiredRole
    });

    if (!currentUser && !inAuthGroup) {
      // Redirect to signin if not authenticated
      console.log('Redirecting to signin - no user');
      router.replace('/(auth)/signin');
    } else if (currentUser && inAuthGroup) {
      // Redirect based on role if authenticated and in auth group
      console.log('User authenticated in auth group, redirecting based on role');
      if (currentUser.role === 'admin') {
        router.replace('/admin/users');
      } else {
        router.replace('/home');
      }
    } else if (inAdminGroup && (!currentUser || currentUser.role !== 'admin')) {
      // Redirect to home if trying to access admin pages without admin role
      console.log('Non-admin trying to access admin route, redirecting to home');
      router.replace('/home');
    }
  }, [currentUser, segments, isLoading, requiredRole]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    console.log('Required role not met, redirecting');
    router.replace('/home');
    return null;
  }

  return children;
} 