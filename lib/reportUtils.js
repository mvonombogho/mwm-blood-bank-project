/**
 * Utility functions for report generation and export
 */

/**
 * Generates a CSV string from an array of objects
 * @param {Array} data - Array of objects with identical structure
 * @returns {string} CSV formatted string
 */
export const generateCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle special cases (commas, quotes, etc.)
      let cell = item[header];
      if (cell === null || cell === undefined) cell = '';
      cell = String(cell);
      
      // Escape quotes and wrap in quotes if it contains commas or quotes
      if (cell.includes(',') || cell.includes('"')) {
        cell = '"' + cell.replace(/"/g, '""') + '"';
      }
      
      return cell;
    }).join(',');
    
    csv += row + '\n';
  });
  
  return csv;
};

/**
 * Generates a simple PDF layout based on report data
 * @param {Object} reportData - Report data including title, summary, and content
 * @returns {Blob} PDF Blob (mock implementation) - In a real app, would return actual PDF
 */
export const generatePDF = (reportData) => {
  // In a real application, this would use a PDF generation library like jsPDF
  // For now, we'll just return a placeholder function that would be replaced
  // with actual PDF generation in production
  
  console.log('Generating PDF for report:', reportData.title);
  console.log('Report summary:', reportData.summary);
  console.log('Report data length:', reportData.data?.length || 0);
  
  // Mock PDF content creation - normally would use jsPDF here
  const pdfContent = `
    ------ ${reportData.title} ------
    Generated on: ${new Date().toLocaleString()}
    
    Summary:
    ${Object.entries(reportData.summary || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}
    
    Data Records: ${reportData.data?.length || 0}
  `;
  
  return pdfContent;
};

/**
 * Generates Excel data (XLSX format)
 * @param {Object} reportData - Report data including sheets
 * @returns {Blob} Excel Blob (mock implementation) - In a real app, would return actual XLSX
 */
export const generateExcel = (reportData) => {
  // In a real application, this would use a library like SheetJS (xlsx)
  // This is a placeholder for actual Excel generation
  
  console.log('Generating Excel for report:', reportData.title);
  console.log('Number of sheets:', Object.keys(reportData.sheets || {}).length);
  
  // Mock Excel creation - would use SheetJS in production
  return `Excel data for ${reportData.title} with ${Object.keys(reportData.sheets || {}).length} sheets`;
};

/**
 * Creates a downloadable file from data
 * @param {string|Blob} data - The file content
 * @param {string} filename - The filename to save as
 * @param {string} type - MIME type of the file
 */
export const downloadFile = (data, filename, type) => {
  // Browser-only function, use in client-side code
  if (typeof window === 'undefined') {
    console.error('downloadFile is a browser-only function');
    return;
  }
  
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Prepare standardized report data for inventory status
 * @param {Array} inventoryData - Array of inventory items
 * @returns {Object} Formatted report data for export
 */
export const prepareInventoryReport = (inventoryData) => {
  if (!Array.isArray(inventoryData)) return { title: 'Inventory Report', summary: {}, data: [] };
  
  // Calculate inventory summary
  const totalUnits = inventoryData.reduce((sum, item) => sum + (item.unitsAvailable || 0), 0);
  const totalCapacity = inventoryData.reduce((sum, item) => sum + (item.capacity || 0), 0);
  const criticalTypes = inventoryData.filter(item => item.status === 'Critical').length;
  const expiringUnits = inventoryData.reduce((sum, item) => sum + (item.expiringIn7Days || 0), 0);
  
  return {
    title: 'Blood Inventory Status Report',
    date: new Date().toISOString(),
    summary: {
      totalUnits,
      totalCapacity,
      utilizationPercentage: totalCapacity > 0 ? Math.round((totalUnits / totalCapacity) * 100) : 0,
      criticalTypes,
      expiringUnits
    },
    data: inventoryData.map(item => ({
      bloodType: item.bloodType,
      unitsAvailable: item.unitsAvailable,
      capacity: item.capacity,
      percentageFull: item.percentageFull,
      status: item.status,
      expiringIn7Days: item.expiringIn7Days
    }))
  };
};

/**
 * Prepare standardized report data for donor activity
 * @param {Array} donationData - Array of donation records
 * @returns {Object} Formatted report data for export
 */
export const prepareDonationReport = (donationData) => {
  if (!Array.isArray(donationData)) return { title: 'Donation Report', summary: {}, data: [] };
  
  // Get period (e.g., month and year)
  const period = donationData[0]?.period || 'Current Period';
  
  // Calculate donation summary
  const totalDonations = donationData.length;
  const uniqueDonors = new Set(donationData.map(item => item.donorId)).size;
  const byBloodType = {};
  
  donationData.forEach(item => {
    if (item.bloodType) {
      byBloodType[item.bloodType] = (byBloodType[item.bloodType] || 0) + 1;
    }
  });
  
  return {
    title: `Donation Activity Report - ${period}`,
    date: new Date().toISOString(),
    summary: {
      period,
      totalDonations,
      uniqueDonors,
      byBloodType: JSON.stringify(byBloodType),
    },
    data: donationData
  };
};
