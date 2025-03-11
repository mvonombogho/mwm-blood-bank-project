import dbConnect from '../../../../lib/dbConnect';
import BloodUnit from '../../../../models/BloodUnit';
import StorageLog from '../../../../models/StorageLog';
import { formatResponse, handleApiError } from '../../../../lib/apiUtils';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'POST') {
    return res.status(405).json(formatResponse(false, null, `Method ${method} Not Allowed`));
  }
  
  await dbConnect();
  
  try {
    const { reportType, timeRange, bloodTypes, includeOptions = [] } = req.body;
    
    // Validate required parameters
    if (!reportType || !timeRange) {
      return res.status(400).json(formatResponse(
        false, 
        null, 
        'Report type and time range are required'
      ));
    }
    
    // Process date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'current':
        // Just use current date
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        // Custom range would be handled here
        break;
    }
    
    // Build query for blood types
    let bloodTypesQuery = {};
    if (bloodTypes && !bloodTypes.includes('all') && bloodTypes.length > 0) {
      bloodTypesQuery = { bloodType: { $in: bloodTypes } };
    }
    
    // Generate different report types
    let reportData = {};
    
    switch (reportType) {
      case 'inventory-summary':
        reportData = await generateInventorySummary(bloodTypesQuery, startDate, now);
        break;
      case 'expiry-analysis':
        reportData = await generateExpiryAnalysis(bloodTypesQuery, startDate, now);
        break;
      case 'historical-trends':
        reportData = await generateHistoricalTrends(bloodTypesQuery, startDate, now);
        break;
      case 'storage-conditions':
        reportData = await generateStorageConditionsReport(startDate, now);
        break;
      case 'critical-shortage':
        reportData = await generateCriticalShortageReport(bloodTypesQuery);
        break;
      default:
        return res.status(400).json(formatResponse(false, null, 'Invalid report type'));
    }
    
    // Add metadata to the report
    reportData.metadata = {
      reportType,
      timeRange,
      bloodTypes,
      includeOptions,
      generatedAt: new Date(),
      reportId: `RPT-${Date.now()}`
    };
    
    return res.status(200).json(formatResponse(true, reportData));
  } catch (error) {
    return handleApiError(error, res);
  }
}

/**
 * Generate inventory summary report
 */
async function generateInventorySummary(bloodTypesQuery, startDate, endDate) {
  // Get current inventory status
  const inventorySummary = await BloodUnit.aggregate([
    { $match: { ...bloodTypesQuery } },
    { 
      $group: {
        _id: '$bloodType',
        total: { $sum: 1 },
        available: { 
          $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
        },
        reserved: { 
          $sum: { $cond: [{ $eq: ['$status', 'Reserved'] }, 1, 0] }
        },
        quarantined: { 
          $sum: { $cond: [{ $eq: ['$status', 'Quarantined'] }, 1, 0] }
        },
        expired: { 
          $sum: { $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0] }
        },
        discarded: { 
          $sum: { $cond: [{ $eq: ['$status', 'Discarded'] }, 1, 0] }
        },
        transfused: { 
          $sum: { $cond: [{ $eq: ['$status', 'Transfused'] }, 1, 0] }
        }
      } 
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Get inventory changes during the time period
  const inventoryChanges = await BloodUnit.aggregate([
    { 
      $match: {
        ...bloodTypesQuery,
        $or: [
          { createdAt: { $gte: startDate, $lte: endDate } },
          { updatedAt: { $gte: startDate, $lte: endDate } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        newDonations: {
          $sum: { $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0] }
        },
        transfused: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'Transfused'] },
                  { $gte: ['$updatedAt', startDate] }
                ]
              }, 
              1, 
              0
            ] 
          }
        },
        expired: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'Expired'] },
                  { $gte: ['$updatedAt', startDate] }
                ]
              }, 
              1, 
              0
            ] 
          }
        },
        discarded: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'Discarded'] },
                  { $gte: ['$updatedAt', startDate] }
                ]
              }, 
              1, 
              0
            ] 
          }
        }
      }
    }
  ]);
  
  // Total counts
  const totalCounts = await BloodUnit.aggregate([
    { $match: { ...bloodTypesQuery } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { 
          $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
        }
      }
    }
  ]);
  
  // Expiring soon (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const expiringSoon = await BloodUnit.countDocuments({
    ...bloodTypesQuery,
    status: 'Available',
    expirationDate: { $lte: sevenDaysFromNow, $gte: new Date() }
  });
  
  return {
    summary: {
      totalUnits: totalCounts.length > 0 ? totalCounts[0].total : 0,
      availableUnits: totalCounts.length > 0 ? totalCounts[0].available : 0,
      expiringSoon: expiringSoon,
      changes: inventoryChanges.length > 0 ? inventoryChanges[0] : {
        newDonations: 0,
        transfused: 0,
        expired: 0,
        discarded: 0
      }
    },
    byBloodType: inventorySummary
  };
}

/**
 * Generate expiry analysis report
 */
async function generateExpiryAnalysis(bloodTypesQuery, startDate, endDate) {
  // Calculate the various expiry periods
  const now = new Date();
  const sevenDays = new Date(now);
  sevenDays.setDate(now.getDate() + 7);
  
  const fourteenDays = new Date(now);
  fourteenDays.setDate(now.getDate() + 14);
  
  const thirtyDays = new Date(now);
  thirtyDays.setDate(now.getDate() + 30);
  
  // Get expiring units by time frame
  const expiringUnits = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: 'Available',
        expirationDate: { $gte: now, $lte: thirtyDays }
      }
    },
    {
      $group: {
        _id: '$bloodType',
        sevenDays: {
          $sum: { $cond: [{ $lte: ['$expirationDate', sevenDays] }, 1, 0] }
        },
        fourteenDays: {
          $sum: { $cond: [{ $lte: ['$expirationDate', fourteenDays] }, 1, 0] }
        },
        thirtyDays: {
          $sum: { $cond: [{ $lte: ['$expirationDate', thirtyDays] }, 1, 0] }
        },
        totalCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Get expired/discarded units during time period
  const wastageStats = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: { $in: ['Expired', 'Discarded'] },
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Calculate wastage rate
  const totalProcessedUnits = await BloodUnit.countDocuments({
    ...bloodTypesQuery,
    $or: [
      { status: { $in: ['Transfused', 'Expired', 'Discarded'] } },
      { 
        status: 'Available',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    ]
  });
  
  const expiredCount = wastageStats.find(s => s._id === 'Expired')?.count || 0;
  const discardedCount = wastageStats.find(s => s._id === 'Discarded')?.count || 0;
  const wastageRate = totalProcessedUnits > 0 ? 
    ((expiredCount + discardedCount) / totalProcessedUnits) * 100 : 0;
  
  // Summary totals
  const totalExpiring = {
    sevenDays: 0,
    fourteenDays: 0,
    thirtyDays: 0
  };
  
  expiringUnits.forEach(unit => {
    totalExpiring.sevenDays += unit.sevenDays;
    totalExpiring.fourteenDays += unit.fourteenDays;
    totalExpiring.thirtyDays += unit.thirtyDays;
  });
  
  return {
    summary: {
      wastageRate: wastageRate.toFixed(2),
      expiredUnits: expiredCount,
      discardedUnits: discardedCount,
      totalExpiring: totalExpiring
    },
    byBloodType: expiringUnits,
    wastageBreakdown: wastageStats
  };
}

/**
 * Generate historical trends report
 */
async function generateHistoricalTrends(bloodTypesQuery, startDate, endDate) {
  // Define the time buckets based on the date range
  const now = new Date();
  const diffDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  
  let timeFormat, groupByFormat;
  
  if (diffDays <= 7) {
    // Daily for a week
    timeFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } };
  } else if (diffDays <= 90) {
    // Weekly for up to 3 months
    timeFormat = { 
      $dateToString: { 
        format: '%Y-%U', // Year-Week
        date: '$createdAt' 
      } 
    };
    groupByFormat = { 
      $dateToString: { 
        format: '%Y-%U', 
        date: '$updatedAt' 
      } 
    };
  } else {
    // Monthly for longer periods
    timeFormat = { 
      $dateToString: { 
        format: '%Y-%m', 
        date: '$createdAt' 
      } 
    };
    groupByFormat = { 
      $dateToString: { 
        format: '%Y-%m', 
        date: '$updatedAt' 
      } 
    };
  }
  
  // Get donation trends
  const donationTrends = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          timeFrame: timeFormat,
          bloodType: '$bloodType'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.timeFrame': 1, '_id.bloodType': 1 } }
  ]);
  
  // Get usage trends
  const usageTrends = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: 'Transfused',
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          timeFrame: groupByFormat,
          bloodType: '$bloodType'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.timeFrame': 1, '_id.bloodType': 1 } }
  ]);
  
  // Get wastage trends
  const wastageTrends = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: { $in: ['Expired', 'Discarded'] },
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          timeFrame: groupByFormat,
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.timeFrame': 1, '_id.status': 1 } }
  ]);
  
  // Format data for time series
  const timeFrames = new Set();
  
  // Get all unique time frames
  donationTrends.forEach(item => timeFrames.add(item._id.timeFrame));
  usageTrends.forEach(item => timeFrames.add(item._id.timeFrame));
  wastageTrends.forEach(item => timeFrames.add(item._id.timeFrame));
  
  // Sort time frames
  const sortedTimeFrames = Array.from(timeFrames).sort();
  
  // Convert to time series data
  const timeSeriesData = sortedTimeFrames.map(timeFrame => {
    const dataPoint = {
      timeFrame,
      donations: {},
      usage: {},
      wastage: {
        expired: 0,
        discarded: 0
      }
    };
    
    // Add donation data
    donationTrends
      .filter(item => item._id.timeFrame === timeFrame)
      .forEach(item => {
        dataPoint.donations[item._id.bloodType] = item.count;
      });
    
    // Add usage data
    usageTrends
      .filter(item => item._id.timeFrame === timeFrame)
      .forEach(item => {
        dataPoint.usage[item._id.bloodType] = item.count;
      });
    
    // Add wastage data
    wastageTrends
      .filter(item => item._id.timeFrame === timeFrame)
      .forEach(item => {
        if (item._id.status === 'Expired') {
          dataPoint.wastage.expired = item.count;
        } else if (item._id.status === 'Discarded') {
          dataPoint.wastage.discarded = item.count;
        }
      });
    
    return dataPoint;
  });
  
  // Calculate summary statistics
  const totalDonations = donationTrends.reduce((sum, item) => sum + item.count, 0);
  const totalUsage = usageTrends.reduce((sum, item) => sum + item.count, 0);
  const totalWastage = wastageTrends.reduce((sum, item) => sum + item.count, 0);
  
  // Blood type totals
  const bloodTypeTotals = {};
  
  // Process donations by blood type
  donationTrends.forEach(item => {
    if (!bloodTypeTotals[item._id.bloodType]) {
      bloodTypeTotals[item._id.bloodType] = {
        donations: 0,
        usage: 0
      };
    }
    bloodTypeTotals[item._id.bloodType].donations += item.count;
  });
  
  // Process usage by blood type
  usageTrends.forEach(item => {
    if (!bloodTypeTotals[item._id.bloodType]) {
      bloodTypeTotals[item._id.bloodType] = {
        donations: 0,
        usage: 0
      };
    }
    bloodTypeTotals[item._id.bloodType].usage += item.count;
  });
  
  return {
    summary: {
      totalDonations,
      totalUsage,
      totalWastage,
      bloodTypeTotals
    },
    trends: timeSeriesData
  };
}

/**
 * Generate storage conditions report
 */
async function generateStorageConditionsReport(startDate, endDate) {
  // Get storage units
  const storageUnits = await StorageLog.find({
    $or: [
      { 'readings.recordedAt': { $gte: startDate, $lte: endDate } },
      { 'maintenanceHistory.performedAt': { $gte: startDate, $lte: endDate } },
      { 'alarmHistory.triggeredAt': { $gte: startDate, $lte: endDate } }
    ]
  });
  
  // Format storage data
  const formattedData = storageUnits.map(unit => {
    // Filter readings within date range
    const readings = unit.readings.filter(reading => {
      const readingDate = new Date(reading.recordedAt);
      return readingDate >= startDate && readingDate <= endDate;
    });
    
    // Filter maintenance records within date range
    const maintenance = unit.maintenanceHistory.filter(record => {
      const recordDate = new Date(record.performedAt);
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Filter alarms within date range
    const alarms = unit.alarmHistory.filter(alarm => {
      const alarmDate = new Date(alarm.triggeredAt);
      return alarmDate >= startDate && alarmDate <= endDate;
    });
    
    // Calculate temperature statistics
    let avgTemp = 0;
    let minTemp = readings.length > 0 ? readings[0].temperature : 0;
    let maxTemp = readings.length > 0 ? readings[0].temperature : 0;
    let tempOutOfRange = 0;
    
    readings.forEach(reading => {
      avgTemp += reading.temperature;
      minTemp = Math.min(minTemp, reading.temperature);
      maxTemp = Math.max(maxTemp, reading.temperature);
      
      if (reading.status === 'Warning' || reading.status === 'Critical') {
        tempOutOfRange++;
      }
    });
    
    avgTemp = readings.length > 0 ? avgTemp / readings.length : 0;
    
    return {
      unitId: unit.storageUnitId,
      facilityId: unit.facilityId,
      status: unit.status,
      temperature: {
        average: avgTemp.toFixed(1),
        min: minTemp,
        max: maxTemp,
        outOfRangeCount: tempOutOfRange,
        outOfRangePercentage: readings.length > 0 ? 
          ((tempOutOfRange / readings.length) * 100).toFixed(1) : 0
      },
      maintenanceCount: maintenance.length,
      alarmCount: alarms.length,
      readingsCount: readings.length
    };
  });
  
  // Calculate overall statistics
  const totalAlarms = formattedData.reduce((sum, unit) => sum + unit.alarmCount, 0);
  const totalMaintenance = formattedData.reduce((sum, unit) => sum + unit.maintenanceCount, 0);
  const totalOutOfRange = formattedData.reduce((sum, unit) => sum + unit.temperature.outOfRangeCount, 0);
  const totalReadings = formattedData.reduce((sum, unit) => sum + unit.readingsCount, 0);
  
  return {
    summary: {
      totalUnits: formattedData.length,
      totalAlarms,
      totalMaintenance,
      temperatureStats: {
        outOfRangeCount: totalOutOfRange,
        outOfRangePercentage: totalReadings > 0 ? 
          ((totalOutOfRange / totalReadings) * 100).toFixed(1) : 0
      }
    },
    storageUnits: formattedData
  };
}

/**
 * Generate critical shortage report
 */
async function generateCriticalShortageReport(bloodTypesQuery) {
  // Define critical thresholds for each blood type
  const criticalThresholds = {
    'O-': 20,  // Higher threshold for universal donor
    'O+': 30,
    'A-': 15,
    'A+': 25,
    'B-': 10,
    'B+': 20,
    'AB-': 5,
    'AB+': 10
  };
  
  // Get current inventory levels
  const inventoryLevels = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: 'Available'
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
  
  // Calculate shortage levels
  const shortageAnalysis = Object.keys(criticalThresholds).map(bloodType => {
    const currentLevel = inventoryLevels.find(item => item._id === bloodType)?.count || 0;
    const threshold = criticalThresholds[bloodType];
    const shortage = Math.max(threshold - currentLevel, 0);
    const status = currentLevel < threshold ? 
      (currentLevel < threshold * 0.5 ? 'Critical' : 'Low') : 'Normal';
    
    return {
      bloodType,
      currentLevel,
      threshold,
      shortage,
      status
    };
  });
  
  // Usage statistics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const usageStats = await BloodUnit.aggregate([
    {
      $match: {
        ...bloodTypesQuery,
        status: 'Transfused',
        updatedAt: { $gte: thirtyDaysAgo }
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
  
  // Calculate days of supply
  const daysOfSupply = shortageAnalysis.map(item => {
    const dailyUsage = usageStats.find(usage => usage._id === item.bloodType)?.count || 0;
    const daysRemaining = dailyUsage > 0 ? 
      Math.round((item.currentLevel / dailyUsage) * 30) : 
      (item.currentLevel > 0 ? 30 : 0);
    
    return {
      ...item,
      dailyUsage: dailyUsage / 30, // Average daily usage
      daysOfSupply: daysRemaining
    };
  });
  
  // Critical cases
  const criticalShortages = daysOfSupply.filter(item => item.status === 'Critical');
  const lowSupply = daysOfSupply.filter(item => item.status === 'Low');
  
  return {
    summary: {
      criticalCount: criticalShortages.length,
      lowCount: lowSupply.length,
      normalCount: daysOfSupply.length - criticalShortages.length - lowSupply.length
    },
    shortageAnalysis: daysOfSupply,
    recommendations: criticalShortages.map(item => ({
      bloodType: item.bloodType,
      unitsNeeded: item.shortage,
      priority: item.daysOfSupply < 3 ? 'Immediate' : 'High',
      recommendation: `Schedule ${item.shortage} donations for ${item.bloodType} within the next ${item.daysOfSupply < 3 ? '24 hours' : '3 days'}.`
    }))
  };
}
