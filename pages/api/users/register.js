import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { formatResponse, handleApiError } from '../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'POST') {
    return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
  
  await dbConnect();
  
  try {
    // Extract user data from request body
    const { name, email, password, role = 'staff' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(formatResponse(false, null, 'User with this email already exists'));
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      status: 'pending' // New users start with pending status
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json(formatResponse(true, userResponse));
  } catch (error) {
    return handleApiError(error, res);
  }
}
