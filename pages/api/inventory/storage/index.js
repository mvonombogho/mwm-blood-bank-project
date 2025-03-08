import dbConnect from '@/lib/mongodb';
import StorageLog from '@/models/StorageLog';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all storage units
    case 'GET':
      try {
        const { 
          facilityId, 
          status, 
          sortBy = 'lastUpdated', 
          sortDir = 'desc' 
        } = req.query;
        
        // Build the query
        let query = {};
        
        if (facilityId) {
          query.facilityId = facilityId;
        }
        
        if (status) {
          query.status = status;
        }
        
        // Validate sort field
        const validSortFields = ['lastUpdated', 'status', 'facilityId', 'storageUnitId'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastUpdated';
        
        // Sort direction
        const sortDirection = sortDir === 'asc' ? 1 : -1;
        
        // Get storage units with sorting
        const storageUnits = await StorageLog.find(query)
          .sort({ [sortField]: sortDirection });
        
        // Calculate current capacity statistics for each unit
        const storageUnitsWithStats = storageUnits.map(unit => {
          const capacityData = unit.capacity || {};
          const total = capacityData.total || 0;
          const used = capacityData.used || 0;
          const available = total - used;
          const utilization = total > 0 ? (used / total) * 100 : 0;
          
          // Get most recent temperature reading
          let latestTemperature = null;
          let latestHumidity = null;
          
          if (unit.readings && unit.readings.length > 0) {
            const latestReading = unit.readings.sort((a, b) => 
              new Date(b.recordedAt) - new Date(a.recordedAt)
            )[0];
            
            latestTemperature = latestReading.temperature;
            latestHumidity = latestReading.humidity;
          }
          
          // Count active alarms
          const activeAlarms = unit.alarmHistory ? 
            unit.alarmHistory.filter(alarm => alarm.status === 'Active').length : 0;
          
          return {
            ...unit.toObject(),
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
        });
        
        res.status(200).json({ 
          success: true, 
          count: storageUnitsWithStats.length,
          data: storageUnitsWithStats 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new storage unit
    case 'POST':
      try {
        const storageData = req.body;
        
        // Validate required fields
        if (!storageData.storageUnitId || !storageData.facilityId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Both storageUnitId and facilityId are required' 
          });
        }
        
        // Check if storage unit already exists
        const existingUnit = await StorageLog.findOne({ 
          storageUnitId: storageData.storageUnitId,
          facilityId: storageData.facilityId
        });
        
        if (existingUnit) {
          return res.status(400).json({ 
            success: false, 
            error: 'A storage unit with this ID already exists at this facility' 
          });
        }
        
        // Set default status if not provided
        if (!storageData.status) {
          storageData.status = 'Operational';
        }
        
        // Set lastUpdated to now
        storageData.lastUpdated = new Date();
        
        // Initialize readings and maintenance history if not provided
        if (!storageData.readings) {
          storageData.readings = [];
        }
        
        if (!storageData.maintenanceHistory) {
          storageData.maintenanceHistory = [];
        }
        
        if (!storageData.alarmHistory) {
          storageData.alarmHistory = [];
        }
        
        // Create storage unit
        const storageUnit = await StorageLog.create(storageData);
        
        res.status(201).json({ success: true, data: storageUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}