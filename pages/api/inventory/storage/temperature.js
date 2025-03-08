import dbConnect from '@/lib/mongodb';
import StorageLog from '@/models/StorageLog';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET temperature readings with filtering
    case 'GET':
      try {
        const { 
          unitId, 
          facilityId, 
          startDate, 
          endDate, 
          status,
          limit = 100
        } = req.query;
        
        // Build query for finding storage units
        let unitQuery = {};
        
        if (unitId) {
          if (mongoose.Types.ObjectId.isValid(unitId)) {
            unitQuery._id = unitId;
          } else {
            unitQuery.storageUnitId = unitId;
          }
        }
        
        if (facilityId) {
          unitQuery.facilityId = facilityId;
        }
        
        // Get storage units
        const storageUnits = await StorageLog.find(unitQuery);
        
        // Extract and filter temperature readings
        let allReadings = [];
        
        storageUnits.forEach(unit => {
          if (!unit.readings || unit.readings.length === 0) return;
          
          // Filter readings based on criteria
          let filteredReadings = unit.readings;
          
          // Filter by date range
          if (startDate || endDate) {
            filteredReadings = filteredReadings.filter(reading => {
              const readingDate = new Date(reading.recordedAt);
              
              if (startDate && endDate) {
                return readingDate >= new Date(startDate) && readingDate <= new Date(endDate);
              } else if (startDate) {
                return readingDate >= new Date(startDate);
              } else if (endDate) {
                return readingDate <= new Date(endDate);
              }
              
              return true;
            });
          }
          
          // Filter by status
          if (status) {
            filteredReadings = filteredReadings.filter(reading => reading.status === status);
          }
          
          // Add unit information to each reading
          const readingsWithUnitInfo = filteredReadings.map(reading => ({
            ...reading.toObject(),
            storageUnit: {
              _id: unit._id,
              storageUnitId: unit.storageUnitId,
              facilityId: unit.facilityId,
              status: unit.status
            }
          }));
          
          allReadings = allReadings.concat(readingsWithUnitInfo);
        });
        
        // Sort by recorded time (newest first)
        allReadings.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
        
        // Apply limit
        if (limit && !isNaN(limit)) {
          allReadings = allReadings.slice(0, parseInt(limit));
        }
        
        res.status(200).json({ 
          success: true, 
          count: allReadings.length,
          data: allReadings 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new temperature reading
    case 'POST':
      try {
        const { unitId, temperature, humidity, recordedBy, notes } = req.body;
        
        if (!unitId || temperature === undefined) {
          return res.status(400).json({ 
            success: false, 
            error: 'Both unitId and temperature are required' 
          });
        }
        
        // Find the storage unit
        let storageUnit;
        if (mongoose.Types.ObjectId.isValid(unitId)) {
          storageUnit = await StorageLog.findById(unitId);
        } else {
          storageUnit = await StorageLog.findOne({ storageUnitId: unitId });
        }
        
        if (!storageUnit) {
          return res.status(404).json({ success: false, error: 'Storage unit not found' });
        }
        
        // Determine temperature status
        // Assuming normal range for blood storage is 2-6°C (35.6-42.8°F)
        let status = 'Normal';
        if (temperature < 2) {
          status = 'Warning';
        } else if (temperature < 1 || temperature > 7) {
          status = 'Critical';
        } else if (temperature > 6) {
          status = 'Warning';
        }
        
        // Create temperature reading
        const reading = {
          temperature,
          humidity: humidity !== undefined ? humidity : null,
          recordedAt: new Date(),
          recordedBy: recordedBy || 'System',
          status,
          notes: notes || ''
        };
        
        // Add reading to storage unit
        if (!storageUnit.readings) {
          storageUnit.readings = [];
        }
        
        storageUnit.readings.push(reading);
        
        // Update lastUpdated timestamp
        storageUnit.lastUpdated = new Date();
        
        // Create an alarm if temperature is critical
        if (status === 'Critical') {
          if (!storageUnit.alarmHistory) {
            storageUnit.alarmHistory = [];
          }
          
          storageUnit.alarmHistory.push({
            alarmType: 'Temperature',
            severity: 'High',
            triggeredAt: new Date(),
            description: `Temperature reading (${temperature}°C) outside safe range`,
            status: 'Active'
          });
        }
        
        // Save the storage unit
        await storageUnit.save();
        
        // Get the newly added reading
        const newReading = storageUnit.readings[storageUnit.readings.length - 1];
        
        res.status(201).json({ 
          success: true, 
          data: {
            ...newReading.toObject(),
            storageUnit: {
              _id: storageUnit._id,
              storageUnitId: storageUnit.storageUnitId,
              facilityId: storageUnit.facilityId,
              status: storageUnit.status
            }
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}