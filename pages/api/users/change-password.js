import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { formatResponse, handleApiError } from '../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'POST') {
    return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
  
  // Check for authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json(formatResponse(false, null, 'Unauthorized'));
  }
  
  await dbConnect();
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user by id
    const user = await User.findById(session.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json(formatResponse(false, null, 'Current password is incorrect'));
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return res.status(200).json(formatResponse(true, { message: 'Password updated successfully' }));
  } catch (error) {
    return handleApiError(error, res);
  }
}
