import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import withAuth from '../../../lib/middlewares/withAuth';

/**
 * API endpoint to get and update the current user's profile
 * This endpoint allows any authenticated user to access their own profile
 * without requiring the canManageUsers permission
 */
async function handler(req, res) {
  await dbConnect();

  try {
    // Get the user ID from the session
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in session' });
    }

    // GET - Get current user's profile
    if (req.method === 'GET') {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(user);
    }
    
    // PUT - Update current user's profile
    if (req.method === 'PUT') {
      // Restrict which fields users can update for themselves
      const { name, email, contactNumber, department } = req.body;
      
      // Find user
      const user = await User.findById(userId);
      
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
      
      // Update allowed fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (contactNumber) user.contactNumber = contactNumber;
      if (department) user.department = department;
      
      // Save the user
      await user.save();
      
      // Return the updated user without password
      const updatedUser = user.toObject();
      delete updatedUser.password;
      
      return res.status(200).json(updatedUser);
    }
    
    // For any other HTTP method
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error(`Error processing user profile:`, error);
    
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

// Protect this endpoint with authentication middleware but with no special permissions required
export default withAuth(handler);
