import dbConnect from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
import StorageLog from '../../../../models/StorageLog';
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
        const storageUnit = await Storage.findById(id);
        
        if (!storageUnit) {
          return res.status(404).json({ message: 'Storage unit not found' });
        }
        
        // Get the most recent storage log data if requested
        if (req.query.includeLog === 'true') {
          const storageLog = await StorageLog.findOne({
            storageUnitId: storageUnit.storageUnitId,
            facilityId: storageUnit.facilityId
          }).sort({ 'readings.recordedAt': -1 }).limit(1);
          
          if (storageLog) {
            return res.status(200).json({
              storageUnit,
              recentLogs: {
                readings: storageLog.readings.slice(0, 10), // Get the 10 most recent readings
                alarms: storageLog.alarmHistory.filter(alarm => alarm.status === 'Active' || alarm.status === 'Acknowledged'),
                maintenanceHistory: storageLog.maintenanceHistory.slice(0, 5) // Get the 5 most recent maintenance records
              }
            });
          }
        }
        
        res.status(200).json({ storageUnit });
      } catch (error) {
        console.error(`Error fetching storage unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid storage unit ID format' });
        }
        
        res.status(500).json({ message: 'Error fetching storage unit', error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const storageUnit = await Storage.findById(id);
        
        if (!storageUnit) {
          return res.status(404).json({ message: 'Storage unit not found' });
        }
        
        // Update fields from request body
        Object.keys(req.body).forEach(key => {
          // Don't directly update nested objects, handle them separately
          if (key !== 'temperature' && 
              key !== 'capacity' && 
              key !== 'location' && 
              key !== 'model' && 
              key !== 'maintenance' && 
              key !== 'monitoring' && 
              key !== 'currentTemperature') {
            storageUnit[key] = req.body[key];
          }
        });
        
        // Handle nested object updates
        ['temperature', 'location', 'model', 'maintenance', 'monitoring'].forEach(nestedKey => {
          if (req.body[nestedKey]) {
            Object.keys(req.body[nestedKey]).forEach(key => {
              storageUnit[nestedKey][key] = req.body[nestedKey][key];
            });
          }
        });
        
        // Special handling for capacity to update availablePercentage
        if (req.body.capacity) {
          const { total = storageUnit.capacity.total, used = storageUnit.capacity.used } = req.body.capacity;
          const availablePercentage = ((total - used) / total) * 100;
          
          storageUnit.capacity = {
            ...storageUnit.capacity,
            ...req.body.capacity,
            availablePercentage
          };
        }
        
        // Update current temperature if provided
        if (req.body.currentTemperature) {
          storageUnit.currentTemperature = {
            value: req.body.currentTemperature.value,
            updatedAt: new Date(),
            status: req.body.currentTemperature.status || 'Normal'
          };
          
          // Also update storage log with the new temperature
          try {
            let storageLog = await StorageLog.findOne({
              storageUnitId: storageUnit.storageUnitId,
              facilityId: storageUnit.facilityId
            });
            
            if (!storageLog) {
              storageLog = await StorageLog.create({
                storageUnitId: storageUnit.storageUnitId,
                facilityId: storageUnit.facilityId,
                readings: [],
                status: storageUnit.status,
                capacity: storageUnit.capacity
              });
            }
            
            // Add new reading
            storageLog.readings.push({
              temperature: req.body.currentTemperature.value,
              humidity: req.body.currentTemperature.humidity,
              recordedAt: new Date(),
              recordedBy: user.id,
              status: req.body.currentTemperature.status || 'Normal',
              notes: req.body.currentTemperature.notes
            });
            
            // Update status and capacity
            storageLog.status = storageUnit.status;
            storageLog.capacity = storageUnit.capacity;
            storageLog.lastUpdated = new Date();
            
            await storageLog.save();
          } catch (logError) {
            console.error('Error updating storage log:', logError);
          }
        }
        
        await storageUnit.save();
        res.status(200).json(storageUnit);
      } catch (error) {
        console.error(`Error updating storage unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid storage unit ID format' });
        }
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Error updating storage unit', error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedStorageUnit = await Storage.findByIdAndDelete(id);
        
        if (!deletedStorageUnit) {
          return res.status(404).json({ message: 'Storage unit not found' });
        }
        
        res.status(200).json({ message: 'Storage unit deleted successfully' });
      } catch (error) {
        console.error(`Error deleting storage unit ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid storage unit ID format' });
        }
        
        res.status(500).json({ message: 'Error deleting storage unit', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
