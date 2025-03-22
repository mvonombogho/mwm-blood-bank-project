import dbConnect from '../../../lib/dbConnect';
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
      // Forward the request to the register endpoint
      // The /api/users/register endpoint has better validation and proper permission handling
      return res.redirect(307, '/api/users/register');
    } catch (error) {
      console.error('Error redirecting user creation:', error);
      return res.status(500).json({ message: 'Error creating user. Please try the register endpoint directly.' });
    }
  }

  // For any other HTTP method
  return res.status(405).json({ message: 'Method not allowed' });
}

// Protect this endpoint with authentication middleware
export default withAuth(handler, {
  requiredPermission: 'canManageUsers',
});