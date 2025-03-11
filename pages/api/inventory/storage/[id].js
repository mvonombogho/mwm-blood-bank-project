import dbConnect from '../../../../lib/dbConnect';
import StorageLog from '../../../../models/StorageLog';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get storage unit by id
        const storageUnit = await StorageLog.findById(id);
        
        if (!storageUnit) {
          return res.status(404).json({ success: false, message: 'Storage unit not found' });
        }
        
        return res.status(200).json({ success: true, data: storageUnit });
      } catch (error) {
        console.error('Error fetching storage unit:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'PUT':
      try {
        // Extract storage unit data from request body
        const storageUnitData = req.body;
        
        // Update lastUpdated field
        storageUnitData.lastUpdated = new Date();
        
        // Update storage unit
        const storageUnit = await StorageLog.findByIdAndUpdate(
          id,
          storageUnitData,
          { new: true, runValidators: true }
        );
        
        if (!storageUnit) {
          return res.status(404).json({ success: false, message: 'Storage unit not found' });
        }
        
        return res.status(200).json({ success: true, data: storageUnit });
      } catch (error) {
        console.error('Error updating storage unit:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    case 'DELETE':
      try {
        // Delete storage unit
        const deletedStorageUnit = await StorageLog.findByIdAndDelete(id);
        
        if (!deletedStorageUnit) {
          return res.status(404).json({ success: false, message: 'Storage unit not found' });
        }
        
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('Error deleting storage unit:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
