import dbConnect from '../../../../lib/dbConnect';
import BloodUnit from '../../../../models/BloodUnit';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'GET') {
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
  
  await dbConnect();
  
  try {
    // Get inventory statistics
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const statuses = ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired'];
    
    // Summary by blood type
    const bloodTypeStats = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
          },
          reserved: {
            $sum: { $cond: [{ $eq: ['$status', 'Reserved'] }, 1, 0] }
          },
          quarantined: {
            $sum: { $cond: [{ $eq: ['$status', 'Quarantined'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Summary by status
    const statusStats = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Expiring soon (in the next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringStats = await BloodUnit.aggregate([
      {
        $match: {
          status: 'Available',
          expirationDate: { $lte: sevenDaysFromNow, $gte: new Date() }
        }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Total counts
    const totalUnits = await BloodUnit.countDocuments();
    const availableUnits = await BloodUnit.countDocuments({ status: 'Available' });
    
    // Format and return the statistics
    return res.status(200).json({
      success: true,
      data: {
        totalUnits,
        availableUnits,
        byBloodType: bloodTypes.map(type => {
          const stats = bloodTypeStats.find(item => item._id === type) || {
            count: 0,
            available: 0,
            reserved: 0,
            quarantined: 0
          };
          return {
            type,
            total: stats.count,
            available: stats.available,
            reserved: stats.reserved,
            quarantined: stats.quarantined
          };
        }),
        byStatus: statuses.map(status => {
          const stats = statusStats.find(item => item._id === status) || { count: 0 };
          return {
            status,
            count: stats.count
          };
        }),
        expiringSoon: {
          total: expiringStats.reduce((sum, item) => sum + item.count, 0),
          byBloodType: bloodTypes.map(type => {
            const stats = expiringStats.find(item => item._id === type) || { count: 0 };
            return {
              type,
              count: stats.count
            };
          })
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blood unit statistics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
