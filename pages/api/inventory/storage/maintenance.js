import dbConnect from '../../../../lib/dbConnect';
import StorageLog from '../../../../models/StorageLog';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get query parameters
        const { storageUnitId, facilityId, type, status } = req.query;
        
        // Build query object
        const query = {};
        const maintenanceQuery = {};
        
        if (storageUnitId) query.storageUnitId = storageUnitId;
        if (facilityId) query.facilityId = facilityId;
        if (type) maintenanceQuery['maintenanceHistory.maintenanceType'] = type;
        if (status) maintenanceQuery['maintenanceHistory.status'] = status;
        
        // Get the storage units matching the query
        const storageUnits = await StorageLog.find(query);
        
        // Filter maintenance records
        const responseData = storageUnits.reduce((result, unit) => {
          const filteredRecords = unit.maintenanceHistory.filter(record => {
            // Apply maintenance query filters
            let isMatch = true;
            
            if (type && record.maintenanceType !== type) isMatch = false;
            if (status && record.status !== status) isMatch = false;
            
            return isMatch;
          });
          
          if (filteredRecords.length > 0) {
            result.push({
              _id: unit._id,
              storageUnitId: unit.storageUnitId,
              facilityId: unit.facilityId,
              maintenanceRecords: filteredRecords
            });
          }
          
          return result;
        }, []);
        
        return res.status(200).json({ success: true, data: responseData });
      } catch (error) {
        console.error('Error fetching maintenance records:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'POST':
      try {
        // Extract data from request body
        const { 
          storageUnitId, 
          facilityId, 
          maintenanceType, 
          performedBy, 
          description,
          parts,
          nextMaintenanceDate,
          status,
          result,
          notes
        } = req.body;
        
        if (!storageUnitId || !facilityId || !maintenanceType || !performedBy || !description) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields' 
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
        
        // Create new maintenance record
        const maintenanceRecord = {
          maintenanceType,
          performedBy,
          performedAt: new Date(),
          description,
          parts: parts || [],
          nextMaintenanceDate,
          status: status || 'Completed',
          result: result || 'Pass',
          notes: notes || ''
        };
        
        // Add to maintenance history
        storageUnit.maintenanceHistory.push(maintenanceRecord);
        
        // Update lastUpdated timestamp
        storageUnit.lastUpdated = new Date();
        
        // Save changes
        await storageUnit.save();
        
        return res.status(201).json({ 
          success: true, 
          data: maintenanceRecord 
        });
      } catch (error) {
        console.error('Error adding maintenance record:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
