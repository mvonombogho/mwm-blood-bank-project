import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';

/**
 * A component that protects routes requiring authentication
 * Redirects to login page if not authenticated
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} [props.requiredPermission] - Optional permission required to access this route
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check if authentication is still loading
    if (status === 'loading') return;
    
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login?returnUrl=' + encodeURIComponent(router.asPath));
      return;
    }
    
    // Check for required permission if specified
    if (requiredPermission && session?.user) {
      const hasPermission = session.user.permissions?.[requiredPermission];
      
      if (!hasPermission) {
        // Redirect to unauthorized page or dashboard
        router.push('/unauthorized');
        return;
      }
    }
    
    // If we get here, the user is authorized
    setAuthorized(true);
  }, [status, session, router, requiredPermission]);
  
  // Show loading state while checking authentication
  if (status === 'loading' || !authorized) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Box textAlign="center">
          <Spinner size="xl" mb={4} />
          <Text>Loading...</Text>
        </Box>
      </Flex>
    );
  }
  
  // For testing purposes, we'll bypass the authentication check
  // Remove this condition in production
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;