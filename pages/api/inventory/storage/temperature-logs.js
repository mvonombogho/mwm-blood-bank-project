import { connectToDatabase } from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
import StorageLog from '../../../../models/StorageLog';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  const { storageUnitId, period = 'day' } = req.query;

  if (!storageUnitId) {
    return res.status(400).json({ message: 'Storage unit ID is required' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    switch (method) {
      case 'GET':
        // Get temperature logs for the specified storage unit
        const storageLog = await StorageLog.findOne({ storageUnitId });
        
        if (!storageLog) {
          return res.status(404).json({ message: 'Storage unit log not found' });
        }

        // Determine time range based on period
        const now = new Date();
        let startDate;
        
        switch (period) {
          case 'day':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
        }

        // Filter readings by date
        const filteredReadings = storageLog.readings.filter(reading => 
          new Date(reading.recordedAt) >= startDate
        );

        // Group readings by hour for better visualization
        const groupedReadings = [];
        const groupMap = new Map();

        filteredReadings.forEach(reading => {
          const date = new Date(reading.recordedAt);
          let key;
          
          // Group by different intervals depending on period
          if (period === 'day') {
            // Group by hour for day view
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
          } else if (period === 'week') {
            // Group by 6-hour intervals for week view
            const hour = Math.floor(date.getHours() / 6) * 6;
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hour}:00`;
          } else {
            // Group by day for month view
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          }
          
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              timestamp: date.toISOString(),
              temperature: reading.temperature,
              humidity: reading.humidity,
              status: reading.status,
              count: 1
            });
          } else {
            const group = groupMap.get(key);
            group.temperature = (group.temperature * group.count + reading.temperature) / (group.count + 1);
            if (reading.humidity) {
              group.humidity = group.humidity 
                ? (group.humidity * group.count + reading.humidity) / (group.count + 1) 
                : reading.humidity;
            }
            // Use the worst status
            if (reading.status === 'Critical' || group.status === 'Critical') {
              group.status = 'Critical';
            } else if (reading.status === 'Warning' && group.status !== 'Critical') {
              group.status = 'Warning';
            }
            group.count++;
          }
        });

        // Convert map to array and sort by timestamp
        for (const [key, value] of groupMap.entries()) {
          groupedReadings.push({
            time: key,
            ...value
          });
        }
        
        groupedReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Get storage unit details for reference
        const storageUnit = await Storage.findOne({ storageUnitId }).lean();
        
        const response = {
          storageUnitId,
          storageUnitName: storageUnit ? storageUnit.name : 'Unknown',
          facilityName: storageUnit ? storageUnit.facilityName : 'Unknown',
          period,
          temperatureRange: storageUnit ? {
            min: storageUnit.temperature.min,
            max: storageUnit.temperature.max,
            target: storageUnit.temperature.target,
            units: storageUnit.temperature.units
          } : null,
          readings: groupedReadings
        };

        return res.status(200).json(response);

      case 'POST':
        // Add new temperature reading
        const { temperature, humidity, status, notes } = req.body;
        
        if (temperature === undefined) {
          return res.status(400).json({ message: 'Temperature is required' });
        }

        // Find the storage log or create if not exists
        let existingLog = await StorageLog.findOne({ storageUnitId });
        
        if (!existingLog) {
          // Get storage unit to create initial log
          const storage = await Storage.findOne({ storageUnitId });
          
          if (!storage) {
            return res.status(404).json({ message: 'Storage unit not found' });
          }
          
          existingLog = new StorageLog({
            storageUnitId,
            facilityId: storage.facilityId,
            readings: [],
            status: 'Operational',
            capacity: {
              total: storage.capacity.total,
              used: storage.capacity.used,
              available: storage.capacity.total - storage.capacity.used
            },
            lastUpdated: new Date()
          });
        }

        // Determine status if not provided
        let readingStatus = status;
        if (!readingStatus) {
          // Get storage unit temperature range
          const storage = await Storage.findOne({ storageUnitId });
          
          if (storage && storage.temperature) {
            if (temperature < storage.temperature.min - 2 || temperature > storage.temperature.max + 2) {
              readingStatus = 'Critical';
            } else if (temperature < storage.temperature.min || temperature > storage.temperature.max) {
              readingStatus = 'Warning';
            } else {
              readingStatus = 'Normal';
            }
          } else {
            readingStatus = 'Normal';
          }
        }

        // Add new reading
        const newReading = {
          temperature,
          humidity,
          recordedAt: new Date(),
          recordedBy: session.user.name || session.user.email,
          status: readingStatus,
          notes
        };

        existingLog.readings.push(newReading);
        existingLog.lastUpdated = new Date();
        
        await existingLog.save();

        // Update storage unit current temperature
        await Storage.updateOne(
          { storageUnitId },
          { 
            $set: { 
              currentTemperature: {
                value: temperature,
                updatedAt: new Date(),
                status: readingStatus
              }
            }
          }
        );

        return res.status(201).json({ 
          message: 'Temperature reading added successfully',
          reading: newReading
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling temperature logs:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
