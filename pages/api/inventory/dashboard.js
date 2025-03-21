import dbConnect from '../../../lib/mongodb';
import BloodUnit from '../../../models/BloodUnit';
import Storage from '../../../models/Storage';
import StorageLog from '../../../models/StorageLog';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Calculate current date and thresholds
    const currentDate = new Date();
    const sevenDaysFromNow = new Date(currentDate);
    sevenDaysFromNow.setDate(currentDate.getDate() + 7);
    
    const fortyEightHoursFromNow = new Date(currentDate);
    fortyEightHoursFromNow.setHours(currentDate.getHours() + 48);

    // Get inventory by blood type
    const bloodTypeAggregate = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const byBloodType = {};
    bloodTypeAggregate.forEach(item => {
      byBloodType[item._id] = item.count;
    });

    // Set default values for all blood types even if none exist
    const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    allBloodTypes.forEach(type => {
      if (!byBloodType[type]) {
        byBloodType[type] = 0;
      }
    });

    // Get inventory by status
    const statusAggregate = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const byStatus = {};
    statusAggregate.forEach(item => {
      byStatus[item._id] = item.count;
    });

    // Set default values for all statuses even if none exist
    const allStatuses = ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired'];
    allStatuses.forEach(status => {
      if (!byStatus[status]) {
        byStatus[status] = 0;
      }
    });

    // Get critical levels (less than 10 units per blood type)
    const criticalThreshold = 10;
    const criticalLevels = await BloodUnit.aggregate([
      {
        $match: {
          status: 'Available'
        }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $lt: criticalThreshold }
        }
      },
      {
        $project: {
          _id: 0,
          bloodType: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: 1 }
      }
    ]);

    // Get expiring units
    const expiringUnits = {
      soon: await BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: { 
          $gt: currentDate, 
          $lte: sevenDaysFromNow 
        }
      }),
      veryClose: await BloodUnit.countDocuments({
        status: 'Available',
        expirationDate: { 
          $gt: currentDate, 
          $lte: fortyEightHoursFromNow 
        }
      })
    };

    // Get temperature alerts
    const storageUnits = await Storage.find({
      status: 'Operational'
    }).lean();

    const temperatureAlerts = [];

    for (const unit of storageUnits) {
      if (unit.currentTemperature && unit.currentTemperature.status !== 'Normal') {
        temperatureAlerts.push({
          location: `${unit.facilityName} - ${unit.name}`,
          currentTemp: unit.currentTemperature.value,
          minTemp: unit.temperature.min,
          maxTemp: unit.temperature.max,
          status: unit.currentTemperature.status
        });
      }
    }

    // Prepare response
    const data = {
      byBloodType,
      byStatus,
      criticalLevels,
      expiringUnits,
      temperatureAlerts
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching inventory dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch inventory data', error: error.message });
  }
}

// Use a more permissive permission for viewing inventory
export default withAuth(handler, { requiredPermission: 'canViewInventory' });
