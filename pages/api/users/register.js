import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password, role, department, contactNumber } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    await dbConnect();
    
    // Check if this is the first user (for admin setup)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    const isAdminRequest = req.query.isAdmin === 'true';
    
    // Only allow admin creation for first user or by existing admins
    const requestedRole = role || 'staff';
    let finalRole = requestedRole;
    
    if (requestedRole === 'admin' && !isFirstUser && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only existing administrators can create admin accounts' });
    }
    
    // For first user setup, allow admin role without authentication
    if (isFirstUser && isAdminRequest) {
      finalRole = 'admin';
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      department,
      contactNumber,
      status: 'active'
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}

// Use dynamic authentication - first user doesn't need auth
export default async function registerHandler(req, res) {
  try {
    await dbConnect();
    const userCount = await User.countDocuments();
    
    // Skip auth middleware for first user
    if (userCount === 0 && req.query.isAdmin === 'true') {
      return handler(req, res);
    }
    
    // Use auth middleware for subsequent users
    return withAuth(handler, { requiredPermission: 'canManageUsers' })(req, res);
  } catch (error) {
    console.error('Error in register handler:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
