import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  await dbConnect();

  try {
    // GET - Get a single user
    if (req.method === 'GET') {
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(user);
    }
    
    // PUT - Update a user
    if (req.method === 'PUT') {
      // Get request body
      const { name, email, role, status, department, contactNumber, permissions } = req.body;
      
      // Find user
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email already exists for another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (status) user.status = status;
      if (department) user.department = department;
      if (contactNumber) user.contactNumber = contactNumber;
      
      // Only allow admin to set custom permissions that override role-based ones
      if (permissions && req.user.role === 'admin') {
        user.permissions = {
          ...user.permissions,
          ...permissions
        };
      }
      
      // Save the user
      await user.save();
      
      // Return the updated user without password
      const updatedUser = user.toObject();
      delete updatedUser.password;
      
      return res.status(200).json(updatedUser);
    }
    
    // DELETE - Delete a user
    if (req.method === 'DELETE') {
      // Only allow admins to delete users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only administrators can delete users' });
      }
      
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ message: 'User deleted successfully' });
    }
    
    // For any other HTTP method
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error(`Error processing user ${id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    return res.status(500).json({ message: 'Server error' });
  }
}

// Protect this endpoint with authentication middleware
export default withAuth(handler, {
  requiredPermission: 'canManageUsers',
});
