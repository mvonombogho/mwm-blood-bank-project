import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import BloodUnit from '@/models/BloodUnit';

export default async function handler(req, res) {
  const {
    query: { id }, // This is the transfusion ID
    method,
  } = req;

  await dbConnect();

  // Find the recipient that has the specific transfusion record
  const recipient = await Recipient.findOne({ 'transfusionRecords.transfusionId': id });

  if (!recipient) {
    return res.status(404).json({ success: false, error: 'Transfusion record not found' });
  }

  // Find the specific transfusion record in the recipient
  const transfusionRecord = recipient.transfusionRecords.find(
    record => record.transfusionId === id
  );

  if (!transfusionRecord) {
    return res.status(404).json({ success: false, error: 'Transfusion record not found' });
  }

  switch (method) {
    // GET transfusion record by ID
    case 'GET':
      try {
        // Get blood unit information if available
        let bloodUnitInfo = null;
        if (transfusionRecord.bloodUnitId) {
          const bloodUnit = await BloodUnit.findById(transfusionRecord.bloodUnitId);
          if (bloodUnit) {
            bloodUnitInfo = {
              _id: bloodUnit._id,
              unitId: bloodUnit.unitId,
              bloodType: bloodUnit.bloodType
            };
          }
        }

        // Return the transfusion record with recipient and blood unit information
        res.status(200).json({
          success: true,
          data: {
            ...transfusionRecord.toObject(),
            recipient: {
              _id: recipient._id,
              recipientId: recipient.recipientId,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              bloodType: recipient.bloodType
            },
            bloodUnit: bloodUnitInfo
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT (update) transfusion record
    case 'PUT':
      try {
        // Find the index of the transfusion record to update
        const recordIndex = recipient.transfusionRecords.findIndex(
          record => record.transfusionId === id
        );
        
        if (recordIndex === -1) {
          return res.status(404).json({ success: false, error: 'Transfusion record not found' });
        }

        // Update only allowed fields
        const allowedFields = [
          'transfusionDate', 'hospital', 'physician', 'diagnosis',
          'reactions', 'outcome', 'notes'
        ];

        const updatedRecord = { ...transfusionRecord.toObject() };
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updatedRecord[field] = req.body[field];
          }
        });

        recipient.transfusionRecords[recordIndex] = updatedRecord;
        await recipient.save();

        // Update blood unit if it's referenced in the transfusion
        if (updatedRecord.bloodUnitId) {
          const bloodUnit = await BloodUnit.findById(updatedRecord.bloodUnitId);
          if (bloodUnit && bloodUnit.transfusionRecord) {
            // Update relevant fields in the blood unit's transfusion record
            if (updatedRecord.transfusionDate) {
              bloodUnit.transfusionRecord.transfusionDate = updatedRecord.transfusionDate;
            }
            if (updatedRecord.hospital) {
              bloodUnit.transfusionRecord.hospital = updatedRecord.hospital;
            }
            if (updatedRecord.physician) {
              bloodUnit.transfusionRecord.physician = updatedRecord.physician;
            }
            if (updatedRecord.notes) {
              bloodUnit.transfusionRecord.notes = updatedRecord.notes;
            }

            await bloodUnit.save();
          }
        }

        // Get blood unit information if available
        let bloodUnitInfo = null;
        if (updatedRecord.bloodUnitId) {
          const bloodUnit = await BloodUnit.findById(updatedRecord.bloodUnitId);
          if (bloodUnit) {
            bloodUnitInfo = {
              _id: bloodUnit._id,
              unitId: bloodUnit.unitId,
              bloodType: bloodUnit.bloodType
            };
          }
        }

        // Return the updated transfusion record with recipient and blood unit information
        res.status(200).json({
          success: true,
          data: {
            ...recipient.transfusionRecords[recordIndex].toObject(),
            recipient: {
              _id: recipient._id,
              recipientId: recipient.recipientId,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              bloodType: recipient.bloodType
            },
            bloodUnit: bloodUnitInfo
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // DELETE transfusion record
    case 'DELETE':
      try {
        // Save blood unit ID before deletion for reverting status
        const bloodUnitId = transfusionRecord.bloodUnitId;

        // Remove the transfusion record from the recipient
        recipient.transfusionRecords = recipient.transfusionRecords.filter(
          record => record.transfusionId !== id
        );
        
        // Update transfusion count
        recipient.transfusionCount = Math.max(0, (recipient.transfusionCount || 0) - 1);
        
        // Update last transfusion date if needed
        if (recipient.transfusionRecords.length > 0) {
          // Find the most recent transfusion date
          recipient.lastTransfusionDate = recipient.transfusionRecords.reduce(
            (latest, record) => {
              const recordDate = new Date(record.transfusionDate);
              return recordDate > latest ? recordDate : latest;
            },
            new Date(0) // Start with earliest possible date
          );
        } else {
          recipient.lastTransfusionDate = null;
        }
        
        await recipient.save();

        // If associated with a blood unit, update it
        if (bloodUnitId) {
          const bloodUnit = await BloodUnit.findById(bloodUnitId);
          if (bloodUnit) {
            // Reset transfusion record
            bloodUnit.transfusionRecord = null;
            
            // Add to status history
            bloodUnit.statusHistory.push({
              status: 'Available',
              date: new Date(),
              updatedBy: 'System',
              notes: 'Transfusion record deleted, blood unit returned to inventory'
            });
            
            // Reset status to Available
            bloodUnit.status = 'Available';
            
            await bloodUnit.save();
          }
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