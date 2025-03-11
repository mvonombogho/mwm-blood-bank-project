import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { formatResponse, handleApiError } from '../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  
  // Check for authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json(formatResponse(false, null, 'Unauthorized'));
  }
  
  // Check for user management permission
  if (!session.user.permissions.canManageUsers) {
    return res.status(403).json(formatResponse(false, null, 'Permission denied'));
  }
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get query parameters
        const { role, status, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
        
        // Build query object
        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get users
        const users = await User.find(query)
          .select('-password')
          .sort({ [sort]: order === 'desc' ? -1 : 1 })
          .limit(parseInt(limit))
          .skip(skip);
        
        // Get total count
        const total = await User.countDocuments(query);
        
        return res.status(200).json(formatResponse(
          true,
          users,
          null,
          {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        ));
      } catch (error) {
        return handleApiError(error, res);
      }
      
    case 'POST':
      try {
        // Extract user data from request body
        const userData = req.body;
        
        // Create new user
        const user = await User.create(userData);
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        return res.status(201).json(formatResponse(
          true,
          userResponse
        ));
      } catch (error) {
        return handleApiError(error, res);
      }
      
    default:
      return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
}
