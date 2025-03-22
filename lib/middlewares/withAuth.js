import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';

/**
 * Middleware to protect API routes requiring authentication
 * @param {function} handler - API route handler function
 * @param {Object} options - Options for the middleware
 * @param {string|string[]} options.requiredRole - Required role(s) for access
 * @param {string|string[]} options.requiredPermission - Required permission(s) for access
 */
const withAuth = (handler, options = {}) => async (req, res) => {
  // Get session using getServerSession
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check for required role if specified
  if (options.requiredRole) {
    const requiredRoles = Array.isArray(options.requiredRole) 
      ? options.requiredRole 
      : [options.requiredRole];
      
    if (!requiredRoles.includes(session.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions: required role not met' 
      });
    }
  }

  // Check for required permission if specified
  if (options.requiredPermission) {
    const requiredPermissions = Array.isArray(options.requiredPermission)
      ? options.requiredPermission
      : [options.requiredPermission];
      
    const userHasPermission = requiredPermissions.every(permission => {
      return session.user.permissions && session.user.permissions[permission];
    });
    
    if (!userHasPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions: required permission not met' 
      });
    }
  }

  // Add user to the request object for convenience
  req.user = session.user;
  
  // Continue to the handler
  return handler(req, res);
};

export default withAuth;