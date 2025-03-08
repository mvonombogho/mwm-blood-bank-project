import dbConnect from '@/lib/mongodb';
import StorageLog from '@/models/StorageLog';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET maintenance records with filtering
    case 'GET':
      try {
        const { 
          unitId, 
          facilityId, 
          maintenanceType, 
          status,
          fromDate,
          toDate,
          limit = 50
        } = req.query;
        
        // Build query for finding storage units
        let unitQuery = {};
        
        if (unitId) {
          if (mongoose.Types.ObjectId.isValid(unitId)) {
            unitQuery._id = unitId;
          } else {
            unitQuery.storageUnitId = unitId;
          }
        }
        
        if (facilityId) {
          unitQuery.facilityId = facilityId;
        }
        
        // Get storage units
        const storageUnits = await StorageLog.find(unitQuery);
        
        // Extract and filter maintenance records
        let allMaintenanceRecords = [];
        
        storageUnits.forEach(unit => {
          if (!unit.maintenanceHistory || unit.maintenanceHistory.length === 0) return;
          
          // Filter maintenance records based on criteria
          let filteredRecords = unit.maintenanceHistory;
          
          // Filter by maintenance type
          if (maintenanceType) {
            filteredRecords = filteredRecords.filter(record => 
              record.maintenanceType === maintenanceType
            );
          }
          
          // Filter by status
          if (status) {
            filteredRecords = filteredRecords.filter(record => 
              record.status === status
            );
          }
          
          // Filter by date range
          if (fromDate || toDate) {
            filteredRecords = filteredRecords.filter(record => {
              const performedDate = new Date(record.performedAt);
              
              if (fromDate && toDate) {
                return performedDate >= new Date(fromDate) && performedDate <= new Date(toDate);
              } else if (fromDate) {
                return performedDate >= new Date(fromDate);
              } else if (toDate) {
                return performedDate <= new Date(toDate);
              }
              
              return true;
            });
          }
          
          // Add unit information to each maintenance record
          const recordsWithUnitInfo = filteredRecords.map(record => ({
            ...record.toObject(),
            storageUnit: {
              _id: unit._id,
              storageUnitId: unit.storageUnitId,
              facilityId: unit.facilityId,
              status: unit.status
            }
          }));
          
          allMaintenanceRecords = allMaintenanceRecords.concat(recordsWithUnitInfo);
        });
        
        // Sort by performed date (newest first)
        allMaintenanceRecords.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
        
        // Apply limit
        if (limit && !isNaN(limit)) {
          allMaintenanceRecords = allMaintenanceRecords.slice(0, parseInt(limit));
        }
        
        res.status(200).json({ 
          success: true, 
          count: allMaintenanceRecords.length,
          data: allMaintenanceRecords 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;