import dbConnect from '../../../../lib/dbConnect';
import BloodUnit from '../../../../models/BloodUnit';
import StorageLog from '../../../../models/StorageLog';
import Report from '../../../../models/Report';
import withAuth from '../../../../lib/middlewares/withAuth';

// The main handler function
async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'POST') {
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
  
  await dbConnect();
  
  try {
    const { 
      reportId,
      reportType, 
      timeRange, 
      bloodTypes = ['all'], 
      includeOptions = [],
      format = 'pdf',
      title
    } = req.body;
    
    // Validate required parameters
    if (!reportType || !timeRange) {
      return res.status(400).json({ 
        message: 'Report type and time range are required'
      });
    }
    
    // First, create or update the report record in the database
    let report;
    
    if (reportId) {
      // Update existing report
      report = await Report.findOne({ reportId });
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      report.status = 'pending';
    } else {
      // Create a new report record
      const newReportId = `RPT-${reportType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const reportTitle = title || getDefaultReportTitle(reportType, timeRange);
      
      report = new Report({
        reportId: newReportId,
        title: reportTitle,
        type: reportType,
        format,
        timeRange,
        parameters: {
          bloodTypes,
          includeOptions,
          otherParams: req.body.otherParams || {}
        },
        description: getReportDescription(reportType),
        status: 'pending',
        createdBy: req.user?.id
      });
      
      await report.save();
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
      case 'custom':
        // Custom range would be handled here
        if (req.body.startDate) {
          startDate = new Date(req.body.startDate);
        }
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
        report.status = 'failed';
        report.error = 'Invalid report type';
        await report.save();
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Add metadata to the report
    reportData.metadata = {
      reportType,
      timeRange,
      bloodTypes,
      includeOptions,
      generatedAt: new Date(),
      reportId: report.reportId
    };
    
    // In a real implementation, you would now:
    // 1. Generate the actual file (PDF, Excel, etc.) based on reportData
    // 2. Save it to disk or cloud storage
    // 3. Update the report record with the file location

    // For this example, we'll simulate file creation
    const fileName = `${report.reportId}.${format}`;
    const filePath = `/reports/${fileName}`;
    const fileSize = Math.floor(Math.random() * 5000000) + 1000000; // Random file size between 1-5MB
    
    // Update the report record with "completed" status and file info
    report.status = 'completed';
    report.filePath = filePath;
    report.fileUrl = `/api/inventory/reports/download/${report.reportId}`;
    report.fileSize = fileSize;
    
    await report.save();
    
    // Return both the report data and report metadata
    return res.status(200).json({
      report: report.toObject(),
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    
    // If a report was being created, update its status to failed
    if (req.body.reportId) {
      try {
        const report = await Report.findOne({ reportId: req.body.reportId });
        if (report) {
          report.status = 'failed';
          report.error = error.message;
          await report.save();
        }
      } catch (updateError) {
        console.error('Error updating report status:', updateError);
      }
    }
    
    return res.status(500).json({ 
      message: 'Failed to generate report', 
      error: error.message 
    });
  }
}

// Helper functions for report titles and descriptions
function getDefaultReportTitle(reportType, timeRange) {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  
  switch (reportType) {
    case 'inventory-summary':
      return timeRange === 'current' 
        ? `Inventory Summary - ${month} ${year}` 
        : `Inventory Summary Report`;
    case 'expiry-analysis':
      return `Blood Expiry Analysis - ${month} ${year}`;
    case 'historical-trends':
      return `Inventory Trends Analysis`;
    case 'storage-conditions':
      return `Storage Conditions Report - ${month} ${year}`;
    case 'critical-shortage':
      return `Critical Shortage Analysis - ${today.toISOString().split('T')[0]}`;
    default:
      return `Blood Bank Report - ${today.toISOString().split('T')[0]}`;
  }
}

function getReportDescription(reportType) {
  switch (reportType) {
    case 'inventory-summary':
      return 'Overview of current blood inventory levels, including all blood types and their availability.';
    case 'expiry-analysis':
      return 'Analysis of blood units expiring in the near future, grouped by expiry date and blood type.';
    case 'historical-trends':
      return 'Historical trends of blood inventory levels, donations, and usage over the selected time period.';
    case 'storage-conditions':
      return 'Report on storage conditions including temperature logs, alerts, and maintenance records.';
    case 'critical-shortage':
      return 'Focused report on blood types currently in critical shortage or below target levels.';
    default:
      return 'Blood bank inventory report.';
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
  // This function implementation is abbreviated for brevity
  // In a real implementation, it would analyze historical donation and usage trends
  return {
    summary: {
      totalDonations: 0,
      totalUsage: 0,
      totalWastage: 0
    },
    trends: []
  };
}

/**
 * Generate storage conditions report
 */
async function generateStorageConditionsReport(startDate, endDate) {
  // This function implementation is abbreviated for brevity
  // In a real implementation, it would analyze storage temperature data
  return {
    summary: {
      totalUnits: 0,
      totalAlarms: 0,
      totalMaintenance: 0,
      temperatureStats: {
        outOfRangeCount: 0,
        outOfRangePercentage: 0
      }
    },
    storageUnits: []
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
  
  // Critical cases
  const criticalShortages = shortageAnalysis.filter(item => item.status === 'Critical');
  const lowSupply = shortageAnalysis.filter(item => item.status === 'Low');
  
  return {
    summary: {
      criticalCount: criticalShortages.length,
      lowCount: lowSupply.length,
      normalCount: shortageAnalysis.length - criticalShortages.length - lowSupply.length
    },
    shortageAnalysis: shortageAnalysis
  };
}

export default withAuth(handler, { requiredPermission: 'canManageReports' });