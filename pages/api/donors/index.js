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
        const donorData = { ...req.body };
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'bloodType', 'email', 'phone', 'hasConsented'];
        const missingFields = requiredFields.filter(field => !donorData[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ 
            message: 'Missing required fields', 
            errors: missingFields.reduce((acc, field) => {
              acc[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
              return acc;
            }, {})
          });
        }
        
        // Create the donor
        const donor = await Donor.create(donorData);
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
        
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyValue)[0];
          return res.status(400).json({ 
            message: 'Duplicate value error', 
            errors: { [field]: `This ${field} is already in use` } 
          });
        }
        
        res.status(500).json({ 
          message: 'Error creating donor', 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

// Temporarily disable authentication for testing purposes
// export default withAuth(handler, { requiredPermission: 'canManageDonors' });
export default handler; // This allows anyone to access the API endpoint for testing