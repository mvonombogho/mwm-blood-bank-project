import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Donor from '@/models/Donor';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET contact information and history
    case 'GET':
      try {
        const { donorId, contactType = 'Donor' } = req.query;
        
        if (!donorId) {
          return res.status(400).json({ success: false, error: 'donorId is required' });
        }
        
        // Find the donor
        let donor;
        let donorObjectId;
        
        if (mongoose.Types.ObjectId.isValid(donorId)) {
          donor = await Donor.findById(donorId);
          donorObjectId = donorId;
        } else {
          donor = await Donor.findOne({ donorId });
          donorObjectId = donor?._id;
        }
        
        if (!donor) {
          return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        
        // Get contact record
        const contactRecord = await Contact.findOne({ 
          contactType,
          relatedId: donorObjectId
        });
        
        if (!contactRecord) {
          // If no contact record exists, return basic donor contact info
          return res.status(200).json({ 
            success: true, 
            data: {
              donor: {
                _id: donor._id,
                donorId: donor.donorId,
                firstName: donor.firstName,
                lastName: donor.lastName,
                email: donor.email,
                phone: donor.phone,
                address: donor.address,
                communicationPreferences: donor.communicationPreferences
              },
              contactRecord: null
            } 
          });
        }
        
        res.status(200).json({ 
          success: true, 
          data: {
            donor: {
              _id: donor._id,
              donorId: donor.donorId,
              firstName: donor.firstName,
              lastName: donor.lastName
            },
            contactRecord
          } 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new communication record
    case 'POST':
      try {
        const { 
          donorId, 
          contactId,
          communicationType, 
          direction = 'Outgoing', 
          subject, 
          content,
          status = 'Sent',
          attachments = [],
          notes
        } = req.body;
        
        // Either donorId or contactId is required
        if (!donorId && !contactId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Either donorId or contactId is required' 
          });
        }
        
        if (!communicationType || !subject) {
          return res.status(400).json({ 
            success: false, 
            error: 'communicationType and subject are required' 
          });
        }
        
        let contactRecord;
        
        // If contactId is provided, find the contact record directly
        if (contactId) {
          contactRecord = await Contact.findById(contactId);
          
          if (!contactRecord) {
            return res.status(404).json({ success: false, error: 'Contact record not found' });
          }
        } 
        // Otherwise, find or create a contact record for the donor
        else {
          // Find the donor
          let donor;
          let donorObjectId;
          
          if (mongoose.Types.ObjectId.isValid(donorId)) {
            donor = await Donor.findById(donorId);
            donorObjectId = donorId;
          } else {
            donor = await Donor.findOne({ donorId });
            donorObjectId = donor?._id;
          }
          
          if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
          }
          
          // Find existing contact record or create a new one
          contactRecord = await Contact.findOne({ 
            contactType: 'Donor',
            relatedId: donorObjectId
          });
          
          if (!contactRecord) {
            // Create a new contact record
            const contactId = `C${donor.donorId.slice(1)}`;
            contactRecord = await Contact.create({
              contactId,
              contactType: 'Donor',
              relatedId: donorObjectId,
              primaryEmail: donor.email,
              primaryPhone: donor.phone,
              address: donor.address,
              preferredContactMethod: 'Email',
              communicationPreferences: donor.communicationPreferences || {
                email: true,
                sms: true,
                phone: true,
                post: false,
                optOutAll: false
              },
              status: 'Active'
            });
          }
        }
        
        // Add the communication record
        const communicationRecord = {
          communicationType,
          direction,
          subject,
          content,
          sentAt: new Date(),
          sentBy: req.body.sentBy || 'System',
          status,
          attachments,
          notes
        };
        
        if (!contactRecord.communicationHistory) {
          contactRecord.communicationHistory = [];
        }
        
        contactRecord.communicationHistory.push(communicationRecord);
        
        // Update lastContactedDate
        contactRecord.lastContactedDate = new Date();
        
        await contactRecord.save();
        
        // Get the newly added communication record
        const newRecord = contactRecord.communicationHistory[contactRecord.communicationHistory.length - 1];
        
        res.status(201).json({ 
          success: true, 
          data: {
            contactRecord: {
              _id: contactRecord._id,
              contactId: contactRecord.contactId,
              contactType: contactRecord.contactType,
              status: contactRecord.status
            },
            communicationRecord: newRecord
          } 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT update contact preferences
    case 'PUT':
      try {
        const { 
          donorId, 
          contactId,
          preferredContactMethod,
          communicationPreferences,
          preferredContactTimes,
          status
        } = req.body;
        
        // Either donorId or contactId is required
        if (!donorId && !contactId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Either donorId or contactId is required' 
          });
        }
        
        let contactRecord;
        let donor;
        
        // If contactId is provided, find the contact record directly
        if (contactId) {
          contactRecord = await Contact.findById(contactId);
          
          if (!contactRecord) {
            return res.status(404).json({ success: false, error: 'Contact record not found' });
          }
          
          // If it's a donor contact, get the donor info
          if (contactRecord.contactType === 'Donor') {
            donor = await Donor.findById(contactRecord.relatedId);
          }
        }
        // Otherwise, find or create a contact record for the donor
        else {
          // Find the donor
          let donorObjectId;
          
          if (mongoose.Types.ObjectId.isValid(donorId)) {
            donor = await Donor.findById(donorId);
            donorObjectId = donorId;
          } else {
            donor = await Donor.findOne({ donorId });
            donorObjectId = donor?._id;
          }
          
          if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
          }
          
          // Find existing contact record or create a new one
          contactRecord = await Contact.findOne({ 
            contactType: 'Donor',
            relatedId: donorObjectId
          });
          
          if (!contactRecord) {
            // Create a new contact record
            const contactId = `C${donor.donorId.slice(1)}`;
            contactRecord = await Contact.create({
              contactId,
              contactType: 'Donor',
              relatedId: donorObjectId,
              primaryEmail: donor.email,
              primaryPhone: donor.phone,
              address: donor.address,
              preferredContactMethod: 'Email',
              communicationPreferences: donor.communicationPreferences || {
                email: true,
                sms: true,
                phone: true,
                post: false,
                optOutAll: false
              },
              status: 'Active'
            });
          }
        }
        
        // Update contact preferences
        if (preferredContactMethod) {
          contactRecord.preferredContactMethod = preferredContactMethod;
        }
        
        if (communicationPreferences) {
          contactRecord.communicationPreferences = {
            ...contactRecord.communicationPreferences,
            ...communicationPreferences
          };
          
          // Also update donor's communication preferences if donor exists
          if (donor) {
            donor.communicationPreferences = {
              ...donor.communicationPreferences,
              ...communicationPreferences
            };
            await donor.save();
          }
        }
        
        if (preferredContactTimes) {
          contactRecord.preferredContactTimes = {
            ...contactRecord.preferredContactTimes,
            ...preferredContactTimes
          };
        }
        
        if (status) {
          contactRecord.status = status;
        }
        
        await contactRecord.save();
        
        res.status(200).json({ 
          success: true, 
          data: contactRecord
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