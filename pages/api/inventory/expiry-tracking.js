import dbConnect from '../../../lib/mongodb';
import BloodUnit from '../../../models/BloodUnit';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await dbConnect();

  try {
    // Parse query parameters
    const days = parseInt(req.query.days, 10) || 30; // Default to 30 days
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // Calculate date thresholds
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    
    // For critical flag, get units expiring within 7 days
    const critical = req.query.critical === 'true';
    const criticalDays = 7;
    const criticalDate = new Date();
    criticalDate.setDate(today.getDate() + criticalDays);
    
    // Build filter
    const filter = {
      status: 'Available',
      expirationDate: {
        $gte: today,
        $lte: critical ? criticalDate : future
      }
    };
    
    // Add blood type filter if provided
    if (req.query.bloodType) {
      filter.bloodType = req.query.bloodType;
    }
    
    // Add location filter if provided
    if (req.query.location) {
      filter['location.facility'] = req.query.location;
    }
    
    // Query with pagination
    const expiringUnits = await BloodUnit.find(filter)
      .sort({ expirationDate: 1 }) // Sort by expiration date, soonest first
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName bloodType');
    
    // Get total count for pagination
    const total = await BloodUnit.countDocuments(filter);
    
    // Group by expiry category for summary
    const [critical3days, warning7days, caution30days] = await Promise.all([
      // Critical - expiring in 3 days
      BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: {
          $gte: today,
          $lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      }),
      
      // Warning - expiring in 7 days
      BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: {
          $gte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 1),
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }),
      
      // Caution - expiring in 30 days
      BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: {
          $gte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 1),
          $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    ]);
    
    // Group by blood type for summary
    const byBloodType = await BloodUnit.aggregate([
      {
        $match: {
          status: 'Available',
          expirationDate: {
            $gte: today,
            $lte: future
          }
        }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const bloodTypeSummary = {};
    byBloodType.forEach(item => {
      bloodTypeSummary[item._id] = item.count;
    });
    
    // Group by expiry month for calendar view
    const monthlyData = await BloodUnit.aggregate([
      {
        $match: {
          status: 'Available',
          expirationDate: {
            $gte: today,
            $lte: new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$expirationDate' },
            month: { $month: '$expirationDate' },
            day: { $dayOfMonth: '$expirationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    const calendarData = monthlyData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }));
    
    res.status(200).json({
      expiringUnits,
      summary: {
        critical: critical3days,
        warning: warning7days,
        caution: caution30days,
        total: critical3days + warning7days + caution30days
      },
      byBloodType: bloodTypeSummary,
      calendarData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching expiry data:', error);
    res.status(500).json({ message: 'Error fetching expiry tracking data', error: error.message });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageInventory' });
