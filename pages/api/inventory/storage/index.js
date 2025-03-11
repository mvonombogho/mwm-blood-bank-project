import { connectToDatabase } from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
import StorageLog from '../../../../models/StorageLog';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    switch (method) {
      case 'GET':
        // Get all storage units
        const storageUnits = await Storage.find({}).sort({ facilityName: 1, name: 1 }).lean();
        return res.status(200).json(storageUnits);

      case 'POST':
        // Create a new storage unit
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
          status,
          notes
        } = req.body;

        // Validate required fields
        if (!storageUnitId || !name || !facilityId || !facilityName || !type) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if storage unit ID already exists
        const existingUnit = await Storage.findOne({ storageUnitId });
        if (existingUnit) {
          return res.status(400).json({ message: 'Storage unit ID already exists' });
        }

        // Create new storage unit
        const newStorageUnit = new Storage({
          storageUnitId,
          name,
          facilityId,
          facilityName,
          type,
          location: location || {},
          temperature: temperature || { min: 2, max: 8, target: 4, units: 'Celsius' },
          capacity: capacity || { total: 0, used: 0, availablePercentage: 100, units: 'Units' },
          model: model || {},
          maintenance: maintenance || {},
          monitoring: monitoring || { hasAlarm: true, monitoringFrequency: 30, autoLogging: true },
          bloodTypes: bloodTypes || ['Any'],
          componentTypes: componentTypes || ['Any'],
          status: status || 'Operational',
          notes: notes || '',
          currentTemperature: {
            value: temperature?.target || 4,
            updatedAt: new Date(),
            status: 'Normal'
          }
        });

        await newStorageUnit.save();

        // Create initial storage log
        const newStorageLog = new StorageLog({
          storageUnitId,
          facilityId,
          readings: [{
            temperature: temperature?.target || 4,
            recordedAt: new Date(),
            recordedBy: session.user.name || session.user.email,
            status: 'Normal'
          }],
          status: 'Operational',
          capacity: {
            total: capacity?.total || 0,
            used: 0,
            available: capacity?.total || 0
          },
          lastUpdated: new Date()
        });

        await newStorageLog.save();

        return res.status(201).json(newStorageUnit);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in storage API:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
