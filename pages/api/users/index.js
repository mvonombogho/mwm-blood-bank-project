import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Get list of users
  if (req.method === 'GET') {
    try {
      // Add pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Add filtering
      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      // Get users (exclude password)
      const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Get total count for pagination
      const total = await User.countDocuments(filter);

      return res.status(200).json({
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users' });
    }
  }

  // POST - Create a new user
  if (req.method === 'POST') {
    try {
      const { email, name, password, role, department, contactNumber } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Create new user
      const user = await User.create({
        email,
        name,
        password,
        role: role || 'staff',
        department,
        contactNumber,
      });

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json(userResponse);
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({ message: 'Validation error', errors });
      }
      
      return res.status(500).json({ message: 'Error creating user' });
    }
  }

  // For any other HTTP method
  return res.status(405).json({ message: 'Method not allowed' });
}

// Protect this endpoint with authentication middleware
export default withAuth(handler, {
  requiredPermission: 'canManageUsers',
});
