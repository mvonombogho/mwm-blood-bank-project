import dbConnect from '../../../../lib/mongodb';
import Storage from '../../../../models/Storage';
import StorageLog from '../../../../models/StorageLog';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();

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
        if (!name || !type) {
          return res.status(400).json({ 
            message: 'Missing required fields', 
            requiredFields: ['name', 'type'] 
          });
        }

        // Generate storageUnitId if not provided
        const newStorageUnitId = storageUnitId || `SU-${Date.now().toString().slice(-6)}`;
        
        // Check if storage unit ID already exists
        const existingUnit = await Storage.findOne({ storageUnitId: newStorageUnitId });
        if (existingUnit) {
          return res.status(400).json({ message: 'Storage unit ID already exists' });
        }

        // Create new storage unit
        const newStorageUnit = new Storage({
          storageUnitId: newStorageUnitId,
          name,
          facilityId: facilityId || 'FAC001',
          facilityName: facilityName || 'Main Facility',
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
          storageUnitId: newStorageUnitId,
          facilityId: facilityId || 'FAC001',
          readings: [{
            temperature: temperature?.target || 4,
            recordedAt: new Date(),
            recordedBy: req.user?.name || req.user?.email || 'System',
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

// Use a more permissive permission for inventory management
export default withAuth(handler, { requiredPermission: 'canViewInventory' });
