import dbConnect from '@/lib/mongodb';
import BloodUnit from '@/models/BloodUnit';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  // Find blood unit either by MongoDB _id or unitId string
  let bloodUnit;
  if (mongoose.Types.ObjectId.isValid(id)) {
    bloodUnit = await BloodUnit.findById(id).populate('donorId', 'firstName lastName donorId bloodType');
  } else {
    bloodUnit = await BloodUnit.findOne({ unitId: id }).populate('donorId', 'firstName lastName donorId bloodType');
  }

  if (!bloodUnit) {
    return res.status(404).json({ success: false, error: 'Blood unit not found' });
  }

  switch (method) {
    // GET blood unit by ID
    case 'GET':
      try {
        res.status(200).json({ success: true, data: bloodUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT (update) blood unit
    case 'PUT':
      try {
        const { status, ...updateData } = req.body;
        
        // If status is being updated, add to status history
        if (status && status !== bloodUnit.status) {
          const statusHistoryEntry = {
            status: status,
            date: new Date(),
            updatedBy: req.body.updatedBy || 'System',
            notes: req.body.statusNotes || `Status changed from ${bloodUnit.status} to ${status}`
          };
          
          // Add to status history
          if (!bloodUnit.statusHistory) {
            bloodUnit.statusHistory = [];
          }
          
          updateData.statusHistory = [...bloodUnit.statusHistory, statusHistoryEntry];
        }
        
        // Update the blood unit
        const updatedBloodUnit = await BloodUnit.findByIdAndUpdate(
          bloodUnit._id,
          { ...updateData, status: status || bloodUnit.status },
          {
            new: true,
            runValidators: true,
          }
        ).populate('donorId', 'firstName lastName donorId bloodType');

        if (!updatedBloodUnit) {
          return res.status(400).json({ success: false, error: 'Blood unit could not be updated' });
        }

        res.status(200).json({ success: true, data: updatedBloodUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // DELETE blood unit
    case 'DELETE':
      try {
        // Check if blood unit can be deleted
        if (bloodUnit.status === 'Transfused') {
          return res.status(400).json({ 
            success: false, 
            error: 'Cannot delete transfused blood unit - historical records must be maintained'
          });
        }
        
        const deletedBloodUnit = await BloodUnit.deleteOne({ _id: bloodUnit._id });
        
        if (deletedBloodUnit.deletedCount === 0) {
          return res.status(400).json({ success: false, error: 'Blood unit could not be deleted' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}