import dbConnect from '@/lib/mongodb';
import StorageLog from '@/models/StorageLog';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  // Find storage unit by MongoDB _id
  let storageUnit;
  if (mongoose.Types.ObjectId.isValid(id)) {
    storageUnit = await StorageLog.findById(id);
  } else {
    // Try to find by storageUnitId
    storageUnit = await StorageLog.findOne({ storageUnitId: id });
  }

  if (!storageUnit) {
    return res.status(404).json({ success: false, error: 'Storage unit not found' });
  }

  switch (method) {
    // GET storage unit by ID
    case 'GET':
      try {
        // Calculate current capacity statistics
        const capacityData = storageUnit.capacity || {};
        const total = capacityData.total || 0;
        const used = capacityData.used || 0;
        const available = total - used;
        const utilization = total > 0 ? (used / total) * 100 : 0;
        
        // Get most recent temperature reading
        let latestTemperature = null;
        let latestHumidity = null;
        
        if (storageUnit.readings && storageUnit.readings.length > 0) {
          const latestReading = storageUnit.readings.sort((a, b) => 
            new Date(b.recordedAt) - new Date(a.recordedAt)
          )[0];
          
          latestTemperature = latestReading.temperature;
          latestHumidity = latestReading.humidity;
        }
        
        // Count active alarms
        const activeAlarms = storageUnit.alarmHistory ? 
          storageUnit.alarmHistory.filter(alarm => alarm.status === 'Active').length : 0;
        
        const enhancedStorageUnit = {
          ...storageUnit.toObject(),
          capacity: {
            ...capacityData,
            available,
            utilization: parseFloat(utilization.toFixed(2))
          },
          currentStats: {
            temperature: latestTemperature,
            humidity: latestHumidity,
            activeAlarms
          }
        };
        
        res.status(200).json({ success: true, data: enhancedStorageUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT (update) storage unit
    case 'PUT':
      try {
        const updateData = req.body;
        
        // Update lastUpdated timestamp
        updateData.lastUpdated = new Date();
        
        // Update the storage unit
        const updatedStorageUnit = await StorageLog.findByIdAndUpdate(
          storageUnit._id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedStorageUnit) {
          return res.status(400).json({ success: false, error: 'Storage unit could not be updated' });
        }

        // Calculate current capacity statistics for the updated unit
        const capacityData = updatedStorageUnit.capacity || {};
        const total = capacityData.total || 0;
        const used = capacityData.used || 0;
        const available = total - used;
        const utilization = total > 0 ? (used / total) * 100 : 0;
        
        // Get most recent temperature reading
        let latestTemperature = null;
        let latestHumidity = null;
        
        if (updatedStorageUnit.readings && updatedStorageUnit.readings.length > 0) {
          const latestReading = updatedStorageUnit.readings.sort((a, b) => 
            new Date(b.recordedAt) - new Date(a.recordedAt)
          )[0];
          
          latestTemperature = latestReading.temperature;
          latestHumidity = latestReading.humidity;
        }
        
        // Count active alarms
        const activeAlarms = updatedStorageUnit.alarmHistory ? 
          updatedStorageUnit.alarmHistory.filter(alarm => alarm.status === 'Active').length : 0;
        
        const enhancedStorageUnit = {
          ...updatedStorageUnit.toObject(),
          capacity: {
            ...capacityData,
            available,
            utilization: parseFloat(utilization.toFixed(2))
          },
          currentStats: {
            temperature: latestTemperature,
            humidity: latestHumidity,
            activeAlarms
          }
        };

        res.status(200).json({ success: true, data: enhancedStorageUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // DELETE storage unit
    case 'DELETE':
      try {
        const deletedStorageUnit = await StorageLog.deleteOne({ _id: storageUnit._id });
        
        if (deletedStorageUnit.deletedCount === 0) {
          return res.status(400).json({ success: false, error: 'Storage unit could not be deleted' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}