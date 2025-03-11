import dbConnect from '../../../../lib/dbConnect';
import BloodUnit from '../../../../models/BloodUnit';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;
  
  // Uncomment this when auth is implemented
  // const session = await getServerSession(req, res, authOptions);
  // if (!session) {
  //   return res.status(401).json({ success: false, message: 'Unauthorized' });
  // }
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Get query parameters for filtering
        const { bloodType, status, expiringBefore, location, limit = 100, page = 1 } = req.query;
        
        // Build query object
        const query = {};
        
        if (bloodType) query.bloodType = bloodType;
        if (status) query.status = status;
        if (expiringBefore) query.expirationDate = { $lte: new Date(expiringBefore) };
        if (location) query['location.facility'] = { $regex: location, $options: 'i' };
        
        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get blood units
        const bloodUnits = await BloodUnit.find(query)
          .limit(parseInt(limit))
          .skip(skip)
          .sort({ collectionDate: -1 });
          
        // Get total count for pagination
        const totalCount = await BloodUnit.countDocuments(query);
        
        return res.status(200).json({ 
          success: true, 
          data: bloodUnits,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching blood units:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
    
    case 'POST':
      try {
        // Extract blood unit data from request body
        const bloodUnitData = req.body;
        
        // Create new blood unit
        const bloodUnit = await BloodUnit.create(bloodUnitData);
        
        return res.status(201).json({ success: true, data: bloodUnit });
      } catch (error) {
        console.error('Error creating blood unit:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
    
    default:
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
