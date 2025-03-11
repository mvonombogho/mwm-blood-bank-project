import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { formatResponse, handleApiError } from '../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  // Check for authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json(formatResponse(false, null, 'Unauthorized'));
  }
  
  // Allow users to get their own data
  const isSelf = session.user.id === id;
  
  // For non-self operations, check for user management permission
  if (!isSelf && !session.user.permissions.canManageUsers) {
    return res.status(403).json(formatResponse(false, null, 'Permission denied'));
  }
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get user by id
        const user = await User.findById(id).select('-password');
        
        if (!user) {
          return res.status(404).json(formatResponse(false, null, 'User not found'));
        }
        
        return res.status(200).json(formatResponse(true, user));
      } catch (error) {
        return handleApiError(error, res);
      }
      
    case 'PUT':
      try {
        // Extract user data from request body
        const userData = req.body;
        
        // Ensure only admins can change roles
        if (userData.role && !isSelf && session.user.role !== 'admin') {
          return res.status(403).json(formatResponse(false, null, 'Only administrators can change user roles'));
        }
        
        // Update user
        const user = await User.findByIdAndUpdate(
          id,
          userData,
          { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
          return res.status(404).json(formatResponse(false, null, 'User not found'));
        }
        
        return res.status(200).json(formatResponse(true, user));
      } catch (error) {
        return handleApiError(error, res);
      }
      
    case 'DELETE':
      try {
        // Prevent self-deletion
        if (isSelf) {
          return res.status(400).json(formatResponse(false, null, 'Cannot delete your own account'));
        }
        
        // Only allow admin to delete users
        if (session.user.role !== 'admin') {
          return res.status(403).json(formatResponse(false, null, 'Only administrators can delete users'));
        }
        
        // Delete user
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
          return res.status(404).json(formatResponse(false, null, 'User not found'));
        }
        
        return res.status(200).json(formatResponse(true, { id }));
      } catch (error) {
        return handleApiError(error, res);
      }
      
    default:
      return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
}
