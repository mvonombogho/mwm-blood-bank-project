import dbConnect from '@/lib/mongodb';
import BloodUnit from '@/models/BloodUnit';
import Donor from '@/models/Donor';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all blood units with filtering
    case 'GET':
      try {
        const { 
          bloodType, 
          status, 
          location, 
          expiryBefore, 
          expiryAfter,
          donorId,
          sort = 'expirationDate',
          sortDirection = 'asc'
        } = req.query;
        
        // Build query object
        let query = {};
        
        // Filter by blood type
        if (bloodType) {
          query.bloodType = bloodType;
        }
        
        // Filter by status
        if (status) {
          query.status = status;
        }
        
        // Filter by location
        if (location) {
          query['location.facility'] = { $regex: location, $options: 'i' };
        }
        
        // Filter by expiration date
        let expiryQuery = {};
        if (expiryBefore) {
          expiryQuery.$lte = new Date(expiryBefore);
        }
        if (expiryAfter) {
          expiryQuery.$gte = new Date(expiryAfter);
        }
        if (Object.keys(expiryQuery).length > 0) {
          query.expirationDate = expiryQuery;
        }
        
        // Filter by donorId
        if (donorId) {
          // Check if valid MongoDB ObjectId or a donor ID string
          let donorObjectId;
          
          if (mongoose.Types.ObjectId.isValid(donorId)) {
            donorObjectId = donorId;
          } else {
            // Search for donor by donorId string
            const donor = await Donor.findOne({ donorId });
            if (donor) {
              donorObjectId = donor._id;
            }
          }
          
          if (donorObjectId) {
            query.donorId = donorObjectId;
          }
        }
        
        // Determine sort direction
        const sortOrder = sortDirection === 'desc' ? -1 : 1;
        
        // Available sort fields mapping
        const sortFields = {
          expirationDate: 'expirationDate',
          collectionDate: 'collectionDate',
          bloodType: 'bloodType',
          status: 'status'
        };
        
        // Validate sort field
        const sortField = sortFields[sort] || 'expirationDate';
        
        // Get blood units with sorting
        const bloodUnits = await BloodUnit.find(query)
          .sort({ [sortField]: sortOrder })
          .populate('donorId', 'firstName lastName donorId bloodType');
        
        res.status(200).json({ 
          success: true, 
          count: bloodUnits.length,
          data: bloodUnits 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new blood unit
    case 'POST':
      try {
        const { donorId, ...unitData } = req.body;
        
        // Validate donor exists
        let donorObjectId;
        
        if (mongoose.Types.ObjectId.isValid(donorId)) {
          donorObjectId = donorId;
        } else {
          // Search for donor by donorId string
          const donor = await Donor.findOne({ donorId });
          if (donor) {
            donorObjectId = donor._id;
          } else {
            return res.status(404).json({ success: false, error: 'Donor not found' });
          }
        }
        
        // Generate unique unit ID if not provided
        if (!unitData.unitId) {
          const date = new Date();
          const year = date.getFullYear().toString().slice(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const count = await BloodUnit.countDocuments({}) + 1;
          unitData.unitId = `BU${year}${month}${day}${count.toString().padStart(4, '0')}`;
        }
        
        // Calculate expiration date if not provided (default: 42 days from collection)
        if (!unitData.expirationDate && unitData.collectionDate) {
          const collectionDate = new Date(unitData.collectionDate);
          unitData.expirationDate = new Date(collectionDate);
          unitData.expirationDate.setDate(unitData.expirationDate.getDate() + 42);
        } else if (!unitData.expirationDate) {
          const today = new Date();
          unitData.expirationDate = new Date(today);
          unitData.expirationDate.setDate(unitData.expirationDate.getDate() + 42);
        }
        
        // Set initial status history if not provided
        if (!unitData.statusHistory || unitData.statusHistory.length === 0) {
          unitData.statusHistory = [{
            status: unitData.status || 'Quarantined',
            date: new Date(),
            updatedBy: 'System',
            notes: 'Initial status upon entry into system'
          }];
        }
        
        // Create blood unit
        const bloodUnit = await BloodUnit.create({
          ...unitData,
          donorId: donorObjectId
        });
        
        // Update donor record
        const donor = await Donor.findById(donorObjectId);
        
        if (donor) {
          // Add donation record
          donor.donations.push({
            donationId: bloodUnit._id,
            date: unitData.collectionDate || new Date(),
            bloodType: unitData.bloodType || donor.bloodType,
            quantity: unitData.quantity || 450, // Default to standard donation volume in ml
            location: unitData.location?.facility || 'Main Facility',
            notes: `Blood Unit ${unitData.unitId}`
          });
          
          // Update last donation date
          donor.lastDonationDate = unitData.collectionDate || new Date();
          
          // Increment donation count
          donor.donationCount = (donor.donationCount || 0) + 1;
          
          await donor.save();
        }
        
        // Populate donor information in response
        const populatedBloodUnit = await BloodUnit.findById(bloodUnit._id)
          .populate('donorId', 'firstName lastName donorId bloodType');
        
        res.status(201).json({ success: true, data: populatedBloodUnit });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}