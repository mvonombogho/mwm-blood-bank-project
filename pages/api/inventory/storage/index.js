import dbConnect from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
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
            { storageUnitId: searchRegex },
            { name: searchRegex },
            { facilityId: searchRegex },
            { facilityName: searchRegex }
          ];
        }
        
        if (req.query.status) {
          filter.status = req.query.status;
        }
        
        if (req.query.type) {
          filter.type = req.query.type;
        }
        
        if (req.query.facility) {
          filter.facilityId = req.query.facility;
        }
        
        if (req.query.bloodType) {
          filter.bloodTypes = req.query.bloodType;
        }
        
        if (req.query.componentType) {
          filter.componentTypes = req.query.componentType;
        }
        
        // Execute query with pagination
        const storageUnits = await Storage.find(filter)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);
        
        // Get total count for pagination
        const total = await Storage.countDocuments(filter);
        
        res.status(200).json({
          storageUnits,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching storage units:', error);
        res.status(500).json({ message: 'Error fetching storage units', error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // Extract data from request body
        const {
          storageUnitId,
          name,
          facilityId,
          facilityName,
          type,
          location,
          temperature,
          capacity,
          model,
          maintenance,
          monitoring,
          bloodTypes,
          componentTypes,
          notes
        } = req.body;
        
        // Validate required fields
        if (!storageUnitId || !name || !facilityId || !facilityName || !type || !location || !temperature || !capacity) {
          return res.status(400).json({
            message: 'Required fields missing',
            requiredFields: ['storageUnitId', 'name', 'facilityId', 'facilityName', 'type', 'location', 'temperature', 'capacity']
          });
        }
        
        // Check if storage unit ID already exists
        const existingUnit = await Storage.findOne({ storageUnitId });
        if (existingUnit) {
          return res.status(400).json({ message: 'Storage unit with this ID already exists' });
        }
        
        // Calculate available capacity percentage
        const availablePercentage = ((capacity.total - capacity.used) / capacity.total) * 100;
        
        // Create the storage unit
        const storageUnit = await Storage.create({
          storageUnitId,
          name,
          facilityId,
          facilityName,
          type,
          location,
          temperature,
          capacity: {
            ...capacity,
            availablePercentage
          },
          model,
          maintenance,
          monitoring,
          bloodTypes,
          componentTypes,
          status: req.body.status || 'Operational',
          notes
        });
        
        res.status(201).json(storageUnit);
      } catch (error) {
        console.error('Error creating storage unit:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Error creating storage unit', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
