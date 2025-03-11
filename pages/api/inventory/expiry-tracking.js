import dbConnect from '../../../lib/dbConnect';
import BloodUnit from '../../../models/BloodUnit';
import { formatResponse, handleApiError } from '../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'GET') {
    return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
  
  await dbConnect();
  
  try {
    // Get query parameters
    const { days = 30, status = 'Available', bloodType } = req.query;
    
    // Calculate the date range for expiration
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + parseInt(days, 10));
    
    // Build query object
    const query = {
      expirationDate: { $gte: today, $lte: endDate },
      status: status
    };
    
    if (bloodType) query.bloodType = bloodType;
    
    // Get expiring blood units
    const expiringUnits = await BloodUnit.find(query)
      .sort({ expirationDate: 1 }); // Sort by expiration date (earliest first)
    
    // Group by days remaining
    const now = new Date();
    const expiryGroups = {
      critical: [], // 1-3 days
      warning: [],  // 4-7 days
      caution: [],  // 8-14 days
      normal: []    // 15+ days
    };
    
    expiringUnits.forEach(unit => {
      // Calculate days remaining
      const expiryDate = new Date(unit.expirationDate);
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      // Add days remaining to the unit data
      const unitData = unit.toObject();
      unitData.daysRemaining = daysRemaining;
      
      // Add to appropriate group
      if (daysRemaining <= 3) {
        expiryGroups.critical.push(unitData);
      } else if (daysRemaining <= 7) {
        expiryGroups.warning.push(unitData);
      } else if (daysRemaining <= 14) {
        expiryGroups.caution.push(unitData);
      } else {
        expiryGroups.normal.push(unitData);
      }
    });
    
    // Calculate statistics
    const stats = {
      totalExpiring: expiringUnits.length,
      byCriteria: {
        critical: expiryGroups.critical.length,
        warning: expiryGroups.warning.length,
        caution: expiryGroups.caution.length,
        normal: expiryGroups.normal.length
      },
      byBloodType: {}
    };
    
    // Group by blood type
    expiringUnits.forEach(unit => {
      if (!stats.byBloodType[unit.bloodType]) {
        stats.byBloodType[unit.bloodType] = 0;
      }
      stats.byBloodType[unit.bloodType]++;
    });
    
    return res.status(200).json(formatResponse(true, {
      stats,
      expiryGroups
    }));
  } catch (error) {
    return handleApiError(error, res);
  }
}
