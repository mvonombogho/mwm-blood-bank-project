import dbConnect from '../../../../lib/dbConnect';
import StorageLog from '../../../../models/StorageLog';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get query parameters for filtering
        const { facilityId, status, limit = 100, page = 1 } = req.query;
        
        // Build query object
        const query = {};
        
        if (facilityId) query.facilityId = facilityId;
        if (status) query.status = status;
        
        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get storage units
        const storageUnits = await StorageLog.find(query)
          .limit(parseInt(limit))
          .skip(skip)
          .sort({ lastUpdated: -1 });
          
        // Get total count for pagination
        const totalCount = await StorageLog.countDocuments(query);
        
        return res.status(200).json({ 
          success: true, 
          data: storageUnits,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching storage units:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'POST':
      try {
        // Extract storage unit data from request body
        const storageUnitData = req.body;
        
        // Create new storage unit
        const storageUnit = await StorageLog.create(storageUnitData);
        
        return res.status(201).json({ success: true, data: storageUnit });
      } catch (error) {
        console.error('Error creating storage unit:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
