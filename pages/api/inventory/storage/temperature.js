import dbConnect from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
import StorageLog from '../../../../models/StorageLog';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // Required parameters
        const { storageUnitId, facilityId } = req.query;
        
        if (!storageUnitId || !facilityId) {
          return res.status(400).json({ 
            message: 'Required parameters missing', 
            requiredParameters: ['storageUnitId', 'facilityId'] 
          });
        }
        
        // Find storage logs
        const storageLog = await StorageLog.findOne({ 
          storageUnitId, 
          facilityId 
        });
        
        if (!storageLog) {
          return res.status(404).json({ message: 'No temperature logs found for this storage unit' });
        }
        
        // Optional time range filtering
        const range = req.query.range || '24h'; // Default 24 hours
        const limit = parseInt(req.query.limit, 10) || 100; // Default 100 readings
        
        let startDate;
        const now = new Date();
        
        switch (range) {
          case '1h':
            startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
            break;
          case '6h':
            startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            break;
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        // Filter readings by date
        const filteredReadings = storageLog.readings
          .filter(reading => new Date(reading.recordedAt) >= startDate)
          .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
          .slice(0, limit);
        
        // Get storage unit details
        const storageUnit = await Storage.findOne({ 
          storageUnitId, 
          facilityId 
        });
        
        // Calculate stats
        const stats = filteredReadings.length > 0 ? {
          average: filteredReadings.reduce((sum, r) => sum + r.temperature, 0) / filteredReadings.length,
          min: Math.min(...filteredReadings.map(r => r.temperature)),
          max: Math.max(...filteredReadings.map(r => r.temperature)),
          latest: filteredReadings[0]?.temperature,
          latestTime: filteredReadings[0]?.recordedAt,
          warningCount: filteredReadings.filter(r => r.status === 'Warning').length,
          criticalCount: filteredReadings.filter(r => r.status === 'Critical').length
        } : null;
        
        res.status(200).json({
          storageUnit: storageUnit ? {
            name: storageUnit.name,
            type: storageUnit.type,
            temperatureRange: {
              min: storageUnit.temperature.min,
              max: storageUnit.temperature.max,
              target: storageUnit.temperature.target,
              units: storageUnit.temperature.units
            },
            status: storageUnit.status,
            location: storageUnit.location
          } : null,
          readings: filteredReadings.map(reading => ({
            temperature: reading.temperature,
            humidity: reading.humidity,
            recordedAt: reading.recordedAt,
            status: reading.status
          })),
          stats
        });
      } catch (error) {
        console.error('Error fetching temperature data:', error);
        res.status(500).json({ message: 'Error fetching temperature data', error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // Extract data from request body
        const { 
          storageUnitId, 
          facilityId, 
          temperature, 
          humidity, 
          status, 
          notes 
        } = req.body;
        
        // Validate required fields
        if (!storageUnitId || !facilityId || temperature === undefined) {
          return res.status(400).json({ 
            message: 'Required fields missing', 
            requiredFields: ['storageUnitId', 'facilityId', 'temperature'] 
          });
        }
        
        // Find or create storage log
        let storageLog = await StorageLog.findOne({ storageUnitId, facilityId });
        
        if (!storageLog) {
          // Get storage unit info
          const storageUnit = await Storage.findOne({ storageUnitId, facilityId });
          
          if (!storageUnit) {
            return res.status(404).json({ message: 'Storage unit not found' });
          }
          
          storageLog = await StorageLog.create({
            storageUnitId,
            facilityId,
            readings: [],
            status: storageUnit.status,
            capacity: storageUnit.capacity
          });
        }
        
        // Determine temperature status if not provided
        let calculatedStatus = status;
        
        if (!calculatedStatus) {
          const storageUnit = await Storage.findOne({ storageUnitId, facilityId });
          
          if (storageUnit && storageUnit.temperature) {
            if (temperature < storageUnit.temperature.min || temperature > storageUnit.temperature.max) {
              // If outside range by more than 20%
              const lowerThreshold = storageUnit.temperature.min - (0.2 * (storageUnit.temperature.max - storageUnit.temperature.min));
              const upperThreshold = storageUnit.temperature.max + (0.2 * (storageUnit.temperature.max - storageUnit.temperature.min));
              
              if (temperature < lowerThreshold || temperature > upperThreshold) {
                calculatedStatus = 'Critical';
              } else {
                calculatedStatus = 'Warning';
              }
            } else {
              calculatedStatus = 'Normal';
            }
          } else {
            calculatedStatus = 'Normal';
          }
        }
        
        // Add new temperature reading
        const newReading = {
          temperature,
          humidity,
          recordedAt: new Date(),
          recordedBy: req.user.id,
          status: calculatedStatus,
          notes
        };
        
        storageLog.readings.push(newReading);
        storageLog.lastUpdated = new Date();
        
        // Check for critical conditions and create alarm if needed
        if (calculatedStatus === 'Critical') {
          const hasActiveAlarm = storageLog.alarmHistory.some(
            alarm => alarm.alarmType === 'Temperature' && 
                    (alarm.status === 'Active' || alarm.status === 'Acknowledged')
          );
          
          if (!hasActiveAlarm) {
            storageLog.alarmHistory.push({
              alarmType: 'Temperature',
              severity: 'High',
              triggeredAt: new Date(),
              description: `Temperature reading of ${temperature}° is critical (outside allowed range)`,
              status: 'Active'
            });
          }
        }
        
        await storageLog.save();
        
        // Update current temperature in storage unit
        await Storage.updateOne(
          { storageUnitId, facilityId },
          { 
            $set: { 
              currentTemperature: {
                value: temperature,
                updatedAt: new Date(),
                status: calculatedStatus
              }
            } 
          }
        );
        
        res.status(201).json({
          message: 'Temperature reading added successfully',
          reading: newReading
        });
      } catch (error) {
        console.error('Error recording temperature:', error);
        res.status(500).json({ message: 'Error recording temperature reading', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
