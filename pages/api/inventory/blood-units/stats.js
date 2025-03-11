import dbConnect from '../../../../lib/mongodb';
import BloodUnit from '../../../../models/BloodUnit';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await dbConnect();

  try {
    // Calculate all stats in parallel for better performance
    const [totalUnits, availableUnits, reservedUnits, quarantinedUnits, expiredUnits, discardedUnits,
           transfusedUnits, expiringIn7Days, expiringIn30Days, bloodTypeDistribution, locationDistribution,
          ageDistribution] = await Promise.all([
      // Total units count
      BloodUnit.countDocuments(),
      
      // Available units count
      BloodUnit.countDocuments({ status: 'Available' }),
      
      // Reserved units count
      BloodUnit.countDocuments({ status: 'Reserved' }),
      
      // Quarantined units count
      BloodUnit.countDocuments({ status: 'Quarantined' }),
      
      // Expired units count
      BloodUnit.countDocuments({ status: 'Expired' }),
      
      // Discarded units count
      BloodUnit.countDocuments({ status: 'Discarded' }),
      
      // Transfused units count
      BloodUnit.countDocuments({ status: 'Transfused' }),
      
      // Units expiring in next 7 days
      BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }),
      
      // Units expiring in next 30 days
      BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      
      // Blood type distribution for available units
      BloodUnit.aggregate([
        { $match: { status: 'Available' } },
        { $group: { _id: '$bloodType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Location distribution
      BloodUnit.aggregate([
        { $match: { status: 'Available' } },
        { $group: { _id: '$location.facility', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Age distribution of available blood units
      BloodUnit.aggregate([
        { $match: { status: 'Available' } },
        {
          $project: {
            ageInDays: {
              $divide: [
                { $subtract: [new Date(), '$collectionDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $bucket: {
            groupBy: '$ageInDays',
            boundaries: [0, 7, 14, 21, 28, 35, 42, 180, 365],
            default: 'older',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ])
    ]);
    
    // Format blood type distribution
    const byBloodType = {};
    bloodTypeDistribution.forEach((item) => {
      byBloodType[item._id] = item.count;
    });
    
    // Format location distribution
    const byLocation = {};
    locationDistribution.forEach((item) => {
      byLocation[item._id || 'Unknown'] = item.count;
    });
    
    // Format age distribution
    const byAge = {};
    ageDistribution.forEach((item) => {
      const key = item._id === 'older' ? 'older' : 
                 `${item._id === 0 ? 0 : item._id + 1}-${item._id === 365 ? 'older' : 
                 ageDistribution[ageDistribution.indexOf(item) + 1]?._id || 'max'} days`;
      byAge[key] = item.count;
    });
    
    res.status(200).json({
      totalUnits,
      availableUnits,
      reservedUnits,
      quarantinedUnits,
      expiredUnits,
      discardedUnits,
      transfusedUnits,
      expiringIn7Days,
      expiringIn30Days,
      byBloodType,
      byLocation,
      byAge
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ message: 'Error fetching inventory statistics', error: error.message });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
