import dbConnect from '../../../../lib/dbConnect';
import BloodUnit from '../../../../models/BloodUnit';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  // Uncomment this when auth is implemented
  // const session = await getServerSession(req, res, authOptions);
  // if (!session) {
  //   return res.status(401).json({ success: false, message: 'Unauthorized' });
  // }
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get blood unit by id
        const bloodUnit = await BloodUnit.findById(id);
        
        if (!bloodUnit) {
          return res.status(404).json({ success: false, message: 'Blood unit not found' });
        }
        
        return res.status(200).json({ success: true, data: bloodUnit });
      } catch (error) {
        console.error('Error fetching blood unit:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'PUT':
      try {
        // Extract blood unit data from request body
        const bloodUnitData = req.body;
        
        // Update blood unit
        const bloodUnit = await BloodUnit.findByIdAndUpdate(
          id,
          bloodUnitData,
          { new: true, runValidators: true }
        );
        
        if (!bloodUnit) {
          return res.status(404).json({ success: false, message: 'Blood unit not found' });
        }
        
        return res.status(200).json({ success: true, data: bloodUnit });
      } catch (error) {
        console.error('Error updating blood unit:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    case 'PATCH':
      try {
        // For updating status and adding status history
        const { status, notes, updatedBy } = req.body;
        
        // Get current blood unit
        const currentBloodUnit = await BloodUnit.findById(id);
        
        if (!currentBloodUnit) {
          return res.status(404).json({ success: false, message: 'Blood unit not found' });
        }
        
        // Add to status history
        const statusHistoryEntry = {
          status,
          date: new Date(),
          updatedBy: updatedBy || 'System',
          notes: notes || ''
        };
        
        // Update blood unit with new status and add to history
        const bloodUnit = await BloodUnit.findByIdAndUpdate(
          id,
          {
            status,
            $push: { statusHistory: statusHistoryEntry }
          },
          { new: true, runValidators: true }
        );
        
        return res.status(200).json({ success: true, data: bloodUnit });
      } catch (error) {
        console.error('Error updating blood unit status:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    case 'DELETE':
      try {
        // Delete blood unit
        const deletedBloodUnit = await BloodUnit.findByIdAndDelete(id);
        
        if (!deletedBloodUnit) {
          return res.status(404).json({ success: false, message: 'Blood unit not found' });
        }
        
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('Error deleting blood unit:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
