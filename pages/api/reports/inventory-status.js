import dbConnect from '../../../lib/mongodb';
import BloodUnit from '../../../models/BloodUnit';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    // Calculate current date for expiry calculations
    const currentDate = new Date();
    const sevenDaysFromNow = new Date(currentDate);
    sevenDaysFromNow.setDate(currentDate.getDate() + 7);

    // Get total available units
    const totalAvailable = await BloodUnit.countDocuments({ status: 'Available' });
    
    // Get blood type distribution
    const bloodTypeDistribution = await BloodUnit.aggregate([
      { $match: { status: 'Available' } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get critical levels (less than 10 units of any blood type)
    const criticalLevels = await BloodUnit.aggregate([
      { $match: { status: 'Available' } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $match: { count: { $lt: 10 } } },
      { $project: { _id: 0, bloodType: '$_id', count: 1 } }
    ]);
    
    // Get units expiring within 7 days
    const expiringUnits = await BloodUnit.countDocuments({
      status: 'Available',
      expirationDate: { 
        $gt: currentDate, 
        $lte: sevenDaysFromNow 
      }
    });
    
    // Calculate storage capacity (for demo purposes, assume total capacity is 1600 units)
    const totalCapacity = 1600;
    const capacityPercentage = Math.round((totalAvailable / totalCapacity) * 100);
    
    res.status(200).json({
      totalAvailable,
      bloodTypeDistribution,
      criticalLevelsCount: criticalLevels.length,
      criticalLevels,
      expiringUnits,
      storageCapacity: {
        used: totalAvailable,
        total: totalCapacity,
        percentage: capacityPercentage
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating inventory status report:', error);
    res.status(500).json({ 
      message: 'Failed to generate inventory status report', 
      error: error.message 
    });
  }
}
