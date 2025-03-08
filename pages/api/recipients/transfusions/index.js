import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import BloodUnit from '@/models/BloodUnit';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all transfusions
    case 'GET':
      try {
        const { recipientId, bloodUnitId } = req.query;
        
        // Build the query based on provided parameters
        let query = {};
        
        // If recipientId is provided, filter by this recipient
        if (recipientId) {
          if (mongoose.Types.ObjectId.isValid(recipientId)) {
            query = { _id: recipientId };
          } else {
            query = { recipientId: recipientId };
          }
        }
        
        // Get recipients and their transfusion records based on query
        const recipients = await Recipient.find(query);
        
        // Extract transfusion records from all recipients
        let allTransfusions = [];
        recipients.forEach(recipient => {
          if (recipient.transfusionRecords && recipient.transfusionRecords.length > 0) {
            // Filter by bloodUnitId if provided
            let transfusions = recipient.transfusionRecords;
            if (bloodUnitId) {
              transfusions = transfusions.filter(t => 
                t.bloodUnitId.toString() === bloodUnitId
              );
            }
            
            // Add recipient info to each transfusion
            const transfusionsWithInfo = transfusions.map(transfusion => ({
              ...transfusion.toObject(),
              recipient: {
                _id: recipient._id,
                recipientId: recipient.recipientId,
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                bloodType: recipient.bloodType
              }
            }));
            
            allTransfusions = allTransfusions.concat(transfusionsWithInfo);
          }
        });
        
        res.status(200).json({ success: true, data: allTransfusions });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new transfusion
    case 'POST':
      try {
        const { recipientId, bloodUnitId, transfusionData } = req.body;
        
        if (!recipientId || !bloodUnitId || !transfusionData) {
          return res.status(400).json({ 
            success: false, 
            error: 'recipientId, bloodUnitId, and transfusionData are all required' 
          });
        }
        
        // Find the recipient
        let recipient;
        if (mongoose.Types.ObjectId.isValid(recipientId)) {
          recipient = await Recipient.findById(recipientId);
        } else {
          recipient = await Recipient.findOne({ recipientId: recipientId });
        }
        
        if (!recipient) {
          return res.status(404).json({ 
            success: false, 
            error: 'Recipient not found' 
          });
        }
        
        // Find the blood unit
        const bloodUnit = await BloodUnit.findById(bloodUnitId);
        
        if (!bloodUnit) {
          return res.status(404).json({ 
            success: false, 
            error: 'Blood unit not found' 
          });
        }
        
        // Check if blood unit is available
        if (bloodUnit.status !== 'Available') {
          return res.status(400).json({ 
            success: false, 
            error: `Blood unit is not available, current status: ${bloodUnit.status}` 
          });
        }
        
        // Generate a unique transfusion ID if not provided
        if (!transfusionData.transfusionId) {
          const date = new Date();
          const year = date.getFullYear().toString().slice(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const count = (recipient.transfusionRecords?.length || 0) + 1;
          transfusionData.transfusionId = `TR${year}${month}${day}${count.toString().padStart(3, '0')}`;
        }
        
        // Set blood unit ID and blood type
        transfusionData.bloodUnitId = bloodUnitId;
        if (!transfusionData.bloodType) {
          transfusionData.bloodType = bloodUnit.bloodType;
        }
        
        // Add transfusion record to recipient
        recipient.transfusionRecords.push(transfusionData);
        
        // Update recipient's last transfusion date and count
        recipient.lastTransfusionDate = transfusionData.transfusionDate || new Date();
        recipient.transfusionCount = (recipient.transfusionCount || 0) + 1;
        
        await recipient.save();
        
        // Update blood unit status to Transfused
        bloodUnit.status = 'Transfused';
        bloodUnit.statusHistory.push({
          status: 'Transfused',
          date: transfusionData.transfusionDate || new Date(),
          updatedBy: transfusionData.physician || 'System',
          notes: `Transfused to recipient ${recipient.recipientId}`
        });
        
        // Add transfusion record to blood unit
        bloodUnit.transfusionRecord = {
          recipientId: recipient._id,
          transfusionDate: transfusionData.transfusionDate || new Date(),
          hospital: transfusionData.hospital,
          physician: transfusionData.physician,
          notes: transfusionData.notes
        };
        
        await bloodUnit.save();
        
        // Get the newly added transfusion record
        const newTransfusion = recipient.transfusionRecords[recipient.transfusionRecords.length - 1];
        
        res.status(201).json({ 
          success: true, 
          data: {
            ...newTransfusion.toObject(),
            recipient: {
              _id: recipient._id,
              recipientId: recipient.recipientId,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              bloodType: recipient.bloodType
            },
            bloodUnit: {
              _id: bloodUnit._id,
              unitId: bloodUnit.unitId,
              bloodType: bloodUnit.bloodType
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