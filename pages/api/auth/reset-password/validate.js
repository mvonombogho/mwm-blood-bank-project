import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    await dbConnect();
    
    // Hash the received token for comparison with the stored one
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and ensure it's not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
}
