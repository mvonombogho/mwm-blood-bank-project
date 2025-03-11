import dbConnect from '../../../../lib/mongodb';
import BloodUnit from '../../../../models/BloodUnit';
import Donor from '../../../../models/Donor';
import withAuth from '../../../../lib/middlewares/withAuth';

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
            { unitId: searchRegex },
            { 'location.facility': searchRegex },
            { 'location.storageUnit': searchRegex }
          ];
        }
        
        if (req.query.bloodType) {
          filter.bloodType = req.query.bloodType;
        }
        
        if (req.query.status) {
          filter.status = req.query.status;
        }
        
        if (req.query.donorId) {
          filter.donorId = req.query.donorId;
        }
        
        if (req.query.expiryBefore) {
          filter.expirationDate = { $lte: new Date(req.query.expiryBefore) };
        }
        
        if (req.query.expiryAfter) {
          if (filter.expirationDate) {
            filter.expirationDate.$gte = new Date(req.query.expiryAfter);
          } else {
            filter.expirationDate = { $gte: new Date(req.query.expiryAfter) };
          }
        }
        
        if (req.query.location) {
          filter['location.facility'] = req.query.location;
        }
        
        // Execute query with pagination
        const bloodUnits = await BloodUnit.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('donorId', 'firstName lastName bloodType');
        
        // Get total count for pagination
        const total = await BloodUnit.countDocuments(filter);
        
        res.status(200).json({
          bloodUnits,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching blood units:', error);
        res.status(500).json({ message: 'Error fetching blood units', error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // Extract data from request body
        const {
          unitId,
          donorId,
          bloodType,
          collectionDate,
          quantity,
          location,
          processingDetails,
          notes
        } = req.body;
        
        // Validate required fields
        if (!unitId || !donorId || !bloodType || !quantity || !location) {
          return res.status(400).json({ 
            message: 'Required fields missing', 
            requiredFields: ['unitId', 'donorId', 'bloodType', 'quantity', 'location'] 
          });
        }
        
        // Check if unitId already exists
        const existingUnit = await BloodUnit.findOne({ unitId });
        if (existingUnit) {
          return res.status(400).json({ message: 'Blood unit with this ID already exists' });
        }
        
        // Verify donor exists
        const donor = await Donor.findById(donorId);
        if (!donor) {
          return res.status(400).json({ message: 'Donor not found' });
        }
        
        // Calculate expiration date (default to 42 days from collection for whole blood)
        const collectionDateTime = collectionDate ? new Date(collectionDate) : new Date();
        let expirationDate;
        
        if (processingDetails && processingDetails.processMethod) {
          switch (processingDetails.processMethod) {
            case 'Plasma':
              // Plasma can be stored for up to a year if frozen
              expirationDate = new Date(collectionDateTime);
              expirationDate.setDate(expirationDate.getDate() + 365);
              break;
            case 'Platelets':
              // Platelets typically expire in 5 days
              expirationDate = new Date(collectionDateTime);
              expirationDate.setDate(expirationDate.getDate() + 5);
              break;
            case 'RBC':
              // Red blood cells can be stored for 42 days
              expirationDate = new Date(collectionDateTime);
              expirationDate.setDate(expirationDate.getDate() + 42);
              break;
            case 'Cryoprecipitate':
              // Cryoprecipitate can be stored for up to a year if frozen
              expirationDate = new Date(collectionDateTime);
              expirationDate.setDate(expirationDate.getDate() + 365);
              break;
            default: // Whole Blood
              // Whole blood expires in 35-42 days depending on storage conditions
              expirationDate = new Date(collectionDateTime);
              expirationDate.setDate(expirationDate.getDate() + 42);
          }
        } else {
          // Default to 42 days for whole blood
          expirationDate = new Date(collectionDateTime);
          expirationDate.setDate(expirationDate.getDate() + 42);
        }
        
        // Create initial status history entry
        const statusHistory = [{
          status: req.body.status || 'Quarantined',
          date: new Date(),
          updatedBy: req.user.id,
          notes: 'Initial status'
        }];
        
        // Create the blood unit
        const bloodUnit = await BloodUnit.create({
          unitId,
          donorId,
          bloodType,
          collectionDate: collectionDateTime,
          expirationDate,
          quantity,
          status: req.body.status || 'Quarantined',
          location,
          processingDetails,
          statusHistory,
          notes
        });
        
        // Update donor's last donation date
        await Donor.findByIdAndUpdate(donorId, {
          lastDonation: collectionDateTime
        });
        
        res.status(201).json(bloodUnit);
      } catch (error) {
        console.error('Error creating blood unit:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid donor ID format' });
        }
        
        res.status(500).json({ message: 'Error creating blood unit', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
