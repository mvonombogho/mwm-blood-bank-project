import dbConnect from '../../../../lib/mongodb';
import BloodUnit from '../../../../models/BloodUnit';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const {
    query: { id },
    method,
    user
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const bloodUnit = await BloodUnit.findById(id)
          .populate('donorId', 'firstName lastName bloodType donorId email phone');
        
        if (!bloodUnit) {
          return res.status(404).json({ message: 'Blood unit not found' });
        }
        
        res.status(200).json(bloodUnit);
      } catch (error) {
        console.error(`Error fetching blood unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid blood unit ID format' });
        }
        
        res.status(500).json({ message: 'Error fetching blood unit', error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const bloodUnit = await BloodUnit.findById(id);
        
        if (!bloodUnit) {
          return res.status(404).json({ message: 'Blood unit not found' });
        }
        
        // Check if status is changing
        const isStatusChanging = req.body.status && req.body.status !== bloodUnit.status;
        
        // If updating status, add to status history
        if (isStatusChanging) {
          const statusHistoryEntry = {
            status: req.body.status,
            date: new Date(),
            updatedBy: user.id,
            notes: req.body.statusNotes || `Status changed from ${bloodUnit.status} to ${req.body.status}`
          };
          
          if (!bloodUnit.statusHistory) {
            bloodUnit.statusHistory = [];
          }
          
          bloodUnit.statusHistory.push(statusHistoryEntry);
        }
        
        // Update fields from request body
        Object.keys(req.body).forEach(key => {
          // Don't directly update nested objects/arrays, handle them separately
          if (key !== 'statusHistory' && key !== 'temperatureHistory' && key !== 'statusNotes') {
            bloodUnit[key] = req.body[key];
          }
        });
        
        // Handle location updates if included
        if (req.body.location) {
          Object.keys(req.body.location).forEach(key => {
            bloodUnit.location[key] = req.body.location[key];
          });
        }
        
        // Handle processing details updates if included
        if (req.body.processingDetails) {
          if (!bloodUnit.processingDetails) {
            bloodUnit.processingDetails = {};
          }
          
          Object.keys(req.body.processingDetails).forEach(key => {
            bloodUnit.processingDetails[key] = req.body.processingDetails[key];
          });
        }
        
        // Add temperature reading if included
        if (req.body.temperature) {
          const temperatureEntry = {
            temperature: req.body.temperature,
            recordedAt: new Date(),
            recordedBy: user.id
          };
          
          if (!bloodUnit.temperatureHistory) {
            bloodUnit.temperatureHistory = [];
          }
          
          bloodUnit.temperatureHistory.push(temperatureEntry);
        }
        
        // Handle transfusion record if unit is being transfused
        if (req.body.transfusionRecord && req.body.status === 'Transfused') {
          bloodUnit.transfusionRecord = req.body.transfusionRecord;
          bloodUnit.transfusionRecord.transfusionDate = bloodUnit.transfusionRecord.transfusionDate || new Date();
        }
        
        await bloodUnit.save();
        res.status(200).json(bloodUnit);
      } catch (error) {
        console.error(`Error updating blood unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid blood unit ID format' });
        }
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Error updating blood unit', error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedBloodUnit = await BloodUnit.findByIdAndDelete(id);
        
        if (!deletedBloodUnit) {
          return res.status(404).json({ message: 'Blood unit not found' });
        }
        
        res.status(200).json({ message: 'Blood unit deleted successfully' });
      } catch (error) {
        console.error(`Error deleting blood unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid blood unit ID format' });
        }
        
        res.status(500).json({ message: 'Error deleting blood unit', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
