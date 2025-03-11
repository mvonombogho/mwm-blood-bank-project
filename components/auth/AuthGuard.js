import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Center,
  Spinner,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Button
} from '@chakra-ui/react';

/**
 * Component to protect routes based on authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render when authenticated
 * @param {string[]} props.requiredRoles - Roles allowed to access the route (optional)
 * @param {Object} props.requiredPermissions - Permissions required to access the route (optional)
 */
const AuthGuard = ({ children, requiredRoles, requiredPermissions }) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check auth when the session is loaded
    if (loading) return;
    
    // Not authenticated
    if (!session) {
      router.push({
        pathname: '/auth/login',
        query: { callbackUrl: router.asPath }
      });
      return;
    }
    
    // Check role-based access if requiredRoles is specified
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(session.user.role)) {
        router.push('/403'); // Access denied page
        return;
      }
    }
    
    // Check permission-based access if requiredPermissions is specified
    if (requiredPermissions) {
      const hasRequiredPermissions = Object.entries(requiredPermissions).every(
        ([permission, required]) => !required || session.user.permissions[permission]
      );
      
      if (!hasRequiredPermissions) {
        router.push('/403'); // Access denied page
        return;
      }
    }
    
    setAuthorized(true);
  }, [loading, session, router, requiredRoles, requiredPermissions]);
  
  // Show loading indicator while checking auth
  if (loading || !authorized) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="red.500"
            size="xl"
          />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }
  
  // Render children once auth is confirmed
  return children;
};

export default AuthGuard;
