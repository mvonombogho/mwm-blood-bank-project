/**
 * Calculate days remaining until expiry
 * @param {Date} expiryDate - The expiration date of the blood unit
 * @returns {number} Days remaining
 */
export function calculateDaysRemaining(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get color scheme for expiry time periods
 * @param {number} daysRemaining - Number of days until expiry
 * @returns {string} Color scheme name
 */
export function getExpiryColorScheme(daysRemaining) {
  if (daysRemaining <= 3) return 'red';
  if (daysRemaining <= 7) return 'orange';
  if (daysRemaining <= 14) return 'yellow';
  return 'green';
}

/**
 * Format blood unit for display
 * @param {Object} bloodUnit - Blood unit data from the database
 * @returns {Object} Formatted blood unit for UI
 */
export function formatBloodUnit(bloodUnit) {
  // Calculate days remaining till expiry
  const daysRemaining = calculateDaysRemaining(bloodUnit.expirationDate);
  
  // Format dates for display
  const collectionDate = new Date(bloodUnit.collectionDate).toLocaleDateString();
  const expirationDate = new Date(bloodUnit.expirationDate).toLocaleDateString();
  
  // Calculate shelf life
  const totalShelfLifeDays = Math.ceil(
    (new Date(bloodUnit.expirationDate) - new Date(bloodUnit.collectionDate)) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Calculate remaining shelf life percentage
  const remainingPercentage = Math.round((daysRemaining / totalShelfLifeDays) * 100);
  
  return {
    ...bloodUnit,
    collectionDate,
    expirationDate,
    daysRemaining,
    expiryStatus: getExpiryStatus(daysRemaining),
    expiryColorScheme: getExpiryColorScheme(daysRemaining),
    remainingPercentage,
    totalShelfLifeDays
  };
}

/**
 * Get text status for expiry period
 * @param {number} daysRemaining - Number of days until expiry
 * @returns {string} Status text
 */
export function getExpiryStatus(daysRemaining) {
  if (daysRemaining <= 0) return 'Expired';
  if (daysRemaining <= 3) return 'Critical';
  if (daysRemaining <= 7) return 'Warning';
  if (daysRemaining <= 14) return 'Caution';
  return 'Normal';
}

/**
 * Group blood units by blood type
 * @param {Array} bloodUnits - Array of blood unit objects
 * @returns {Object} Grouped blood units
 */
export function groupByBloodType(bloodUnits) {
  const bloodTypeGroups = {
    'A+': [],
    'A-': [],
    'B+': [],
    'B-': [],
    'AB+': [],
    'AB-': [],
    'O+': [],
    'O-': []
  };
  
  bloodUnits.forEach(unit => {
    if (bloodTypeGroups[unit.bloodType]) {
      bloodTypeGroups[unit.bloodType].push(unit);
    }
  });
  
  return bloodTypeGroups;
}

/**
 * Get status color scheme for blood unit
 * @param {string} status - Status of the blood unit
 * @returns {string} Color scheme name
 */
export function getStatusColorScheme(status) {
  switch (status) {
    case 'Available': return 'green';
    case 'Reserved': return 'blue';
    case 'Quarantined': return 'orange';
    case 'Transfused': return 'purple';
    case 'Discarded': return 'red';
    case 'Expired': return 'gray';
    default: return 'gray';
  }
}

/**
 * Calculate expiry statistics for blood inventory
 * @param {Array} bloodUnits - Array of blood unit objects
 * @returns {Object} Expiry statistics
 */
export function calculateExpiryStats(bloodUnits) {
  const stats = {
    totalUnits: bloodUnits.length,
    expiringSoon: {
      critical: 0,  // 1-3 days
      warning: 0,   // 4-7 days
      caution: 0,   // 8-14 days
      normal: 0     // 15+ days
    },
    byBloodType: {
      'A+': { total: 0, expiringSoon: 0 },
      'A-': { total: 0, expiringSoon: 0 },
      'B+': { total: 0, expiringSoon: 0 },
      'B-': { total: 0, expiringSoon: 0 },
      'AB+': { total: 0, expiringSoon: 0 },
      'AB-': { total: 0, expiringSoon: 0 },
      'O+': { total: 0, expiringSoon: 0 },
      'O-': { total: 0, expiringSoon: 0 }
    }
  };
  
  bloodUnits.forEach(unit => {
    const daysRemaining = calculateDaysRemaining(unit.expirationDate);
    
    // Count by blood type
    if (stats.byBloodType[unit.bloodType]) {
      stats.byBloodType[unit.bloodType].total++;
      
      // Count expiring soon (within 7 days)
      if (daysRemaining <= 7) {
        stats.byBloodType[unit.bloodType].expiringSoon++;
      }
    }
    
    // Count by expiry category
    if (daysRemaining <= 3) {
      stats.expiringSoon.critical++;
    } else if (daysRemaining <= 7) {
      stats.expiringSoon.warning++;
    } else if (daysRemaining <= 14) {
      stats.expiringSoon.caution++;
    } else {
      stats.expiringSoon.normal++;
    }
  });
  
  return stats;
}
