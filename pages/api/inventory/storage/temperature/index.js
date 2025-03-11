import dbConnect from '../../../../../lib/dbConnect';
import StorageLog from '../../../../../models/StorageLog';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get query parameters
        const { storageUnitId, facilityId, startDate, endDate, limit = 100 } = req.query;
        
        if (!storageUnitId && !facilityId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Either storageUnitId or facilityId is required' 
          });
        }
        
        // Build query object
        const query = {};
        
        if (storageUnitId) query.storageUnitId = storageUnitId;
        if (facilityId) query.facilityId = facilityId;
        
        // Get the storage units matching the query
        const storageUnits = await StorageLog.find(query);
        
        // Filter temperature readings based on date range if provided
        const responseData = storageUnits.map(unit => {
          // Clone the unit object to avoid modifying the original
          const unitData = {
            _id: unit._id,
            storageUnitId: unit.storageUnitId,
            facilityId: unit.facilityId,
            status: unit.status,
            readings: [...unit.readings] // Clone the readings array
          };
          
          // Apply date filters if provided
          if (startDate || endDate) {
            const startDateTime = startDate ? new Date(startDate) : new Date(0); // Epoch if not provided
            const endDateTime = endDate ? new Date(endDate) : new Date(); // Current time if not provided
            
            // Filter readings based on date range
            unitData.readings = unitData.readings.filter(reading => {
              const readingDate = new Date(reading.recordedAt);
              return readingDate >= startDateTime && readingDate <= endDateTime;
            });
          }
          
          // Limit the number of readings if specified
          if (unitData.readings.length > parseInt(limit)) {
            unitData.readings = unitData.readings.slice(-parseInt(limit)); // Get the most recent readings
          }
          
          // Sort readings by recordedAt (newest first)
          unitData.readings.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
          
          return unitData;
        });
        
        return res.status(200).json({ success: true, data: responseData });
      } catch (error) {
        console.error('Error fetching temperature readings:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'POST':
      try {
        // Extract data from request body
        const { storageUnitId, facilityId, temperature, humidity, recordedBy, status, notes } = req.body;
        
        if (!storageUnitId || !facilityId || temperature === undefined) {
          return res.status(400).json({ 
            success: false, 
            message: 'storageUnitId, facilityId, and temperature are required' 
          });
        }
        
        // Find the storage unit
        const storageUnit = await StorageLog.findOne({ 
          storageUnitId, 
          facilityId 
        });
        
        if (!storageUnit) {
          return res.status(404).json({ 
            success: false, 
            message: 'Storage unit not found' 
          });
        }
        
        // Create new reading entry
        const newReading = {
          temperature,
          humidity,
          recordedAt: new Date(),
          recordedBy: recordedBy || 'System',
          status: status || 'Normal',
          notes: notes || ''
        };
        
        // Add to readings array
        storageUnit.readings.push(newReading);
        
        // Update lastUpdated timestamp
        storageUnit.lastUpdated = new Date();
        
        // Save changes
        await storageUnit.save();
        
        return res.status(201).json({ 
          success: true, 
          data: newReading 
        });
      } catch (error) {
        console.error('Error adding temperature reading:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
