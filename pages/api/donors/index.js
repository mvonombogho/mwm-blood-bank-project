import dbConnect from '../../../lib/mongodb';
import Donor from '../../../models/Donor';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // Parse query parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        if (req.query.search) {
          const searchRegex = new RegExp(req.query.search, 'i');
          filter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { donorId: searchRegex }
          ];
        }
        
        if (req.query.bloodType) {
          filter.bloodType = req.query.bloodType;
        }
        
        if (req.query.status) {
          filter.status = req.query.status;
        }
        
        // Execute query with pagination
        const donors = await Donor.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        
        // Get total count for pagination
        const total = await Donor.countDocuments(filter);
        
        res.status(200).json({
          donors,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({ message: 'Error fetching donors', error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // Create a new donor
        const donor = await Donor.create(req.body);
        res.status(201).json(donor);
      } catch (error) {
        console.error('Error creating donor:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Error creating donor', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageDonors' });
