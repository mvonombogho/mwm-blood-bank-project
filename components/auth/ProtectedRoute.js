import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Spinner, Flex, Text, Box } from '@chakra-ui/react';

/**
 * Wrapper component to protect routes that require authentication
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render when authenticated
 * @param {string|string[]} [props.requiredRole] - Role(s) required to access this route
 * @param {string|string[]} [props.requiredPermission] - Permission(s) required to access this route
 * @param {string} [props.redirectTo] - URL to redirect to if authentication fails
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/auth/login'
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Still loading session, don't do anything yet
    if (status === 'loading') return;

    // Not authenticated
    if (!session) {
      router.push({
        pathname: redirectTo,
        query: { callbackUrl: router.asPath } // Store the current URL to redirect back after login
      });
      return;
    }

    // Check for required role
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!requiredRoles.includes(session.user.role)) {
        router.push('/403');
        return;
      }
    }

    // Check for required permission
    if (requiredPermission) {
      const requiredPermissions = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];
      
      const hasRequiredPermissions = requiredPermissions.every(
        permission => session.user.permissions && session.user.permissions[permission]
      );

      if (!hasRequiredPermissions) {
        router.push('/403');
        return;
      }
    }

    // All checks passed
    setIsAuthorized(true);
  }, [session, status, router, requiredRole, requiredPermission, redirectTo]);

  // Show loading spinner while checking authorization
  if (status === 'loading' || !isAuthorized) {
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} fontSize="lg" color="gray.600">
          Loading...
        </Text>
      </Flex>
    );
  }

  // Render children only after authorization is confirmed
  return <>{children}</>;
};

export default ProtectedRoute;
