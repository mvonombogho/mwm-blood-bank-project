import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        // Check if the registration secret is correct (basic security)
        const { name, email, password, role, registrationSecret } = req.body;

        // Simple validation
        if (!name || !email || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please provide name, email, and password' 
          });
        }

        // Verify registration secret to prevent unauthorized user creation
        // This is a simple security measure - replace with your own secret
        if (registrationSecret !== process.env.REGISTRATION_SECRET) {
          return res.status(403).json({ 
            success: false, 
            message: 'Invalid registration secret' 
          });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'User with this email already exists' 
          });
        }

        // Create user with admin permissions for first user
        const user = await User.create({
          name,
          email,
          password,
          role: role || 'admin',
          permissions: [
            'canManageDonors',
            'canManageRecipients',
            'canManageInventory',
            'canManageUsers',
            'canViewReports',
            'canExportData'
          ],
          isActive: true,
          createdAt: new Date()
        });

        // Don't return the password
        user.password = undefined;

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: user
        });
      } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
          success: false, 
          message: error.message || 'Error registering user' 
        });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}