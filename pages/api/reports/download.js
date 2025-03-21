import { connectToDatabase } from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { getSession } from 'next-auth/react';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await connectToDatabase();
    
    const { report: reportType, id, format = 'pdf' } = req.query;
    
    if (!reportType && !id) {
      return res.status(400).json({ message: 'Report type or ID is required' });
    }
    
    let reportData;
    
    // Get report data based on ID if provided, otherwise generate it
    if (id) {
      const reportDoc = await Report.findById(id);
      if (!reportDoc) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Increment download count
      await Report.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
      
      reportData = {
        title: reportDoc.title,
        type: reportDoc.type,
        data: reportDoc.data,
        createdAt: reportDoc.createdAt
      };
    } else {
      // Generate report data on the fly if no ID is provided
      switch (reportType) {
        case 'inventory-status':
          reportData = { 
            title: 'Blood Inventory Status',
            type: 'inventory-status',
            data: await generateInventoryStatusReport(),
            createdAt: new Date()
          };
          break;
          
        case 'donation-statistics':
          reportData = {
            title: 'Donation Statistics',
            type: 'donation-statistics',
            data: await generateDonationStatisticsReport(),
            createdAt: new Date()
          };
          break;
          
        case 'donor-demographics':
          reportData = {
            title: 'Donor Demographics',
            type: 'donor-demographics',
            data: await generateDonorDemographicsReport(),
            createdAt: new Date()
          };
          break;
          
        case 'expiry-forecast':
          reportData = {
            title: 'Expiry Forecast',
            type: 'expiry-forecast',
            data: await generateExpiryForecastReport(),
            createdAt: new Date()
          };
          break;
          
        default:
          return res.status(400).json({ message: 'Invalid report type' });
      }
    }
    
    // Format and send response based on requested format
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${reportData.title.toLowerCase().replace(/\s+/g, '_')}_${date}`;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
        
        // Generate and stream PDF
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);
        
        // Add content to PDF
        generatePDF(doc, reportData);
        
        doc.end();
        return;
        
      case 'csv':
        // Convert data to CSV
        const csv = convertToCSV(reportData.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
        return res.status(200).send(csv);
        
      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.json`);
        return res.status(200).json(reportData.data);
    }
  } catch (error) {
    console.error(`Error generating report:`, error);
    res.status(500).json({ 
      message: `Failed to generate report`, 
      error: error.message 
    });
  }
}

// Helper function to generate PDF from report data
function generatePDF(doc, reportData) {
  const { title, data, createdAt } = reportData;
  
  // Add header
  doc.fontSize(25)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Generated on: ${new Date(createdAt).toLocaleString()}`, { align: 'center' });
  
  doc.moveDown();
  doc.moveDown();
  
  // Add content based on report type
  // Process simple key-value fields first
  Object.entries(data)
    .filter(([key, value]) => 
      !['title', 'generatedAt'].includes(key) && 
      typeof value !== 'object'
    )
    .forEach(([key, value]) => {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`${formattedKey}:`, { continued: true })
         .font('Helvetica')
         .text(` ${value}`);
      
      doc.moveDown(0.5);
    });
  
  // Process objects (like distributions)
  Object.entries(data)
    .filter(([key, value]) => typeof value === 'object' && value !== null)
    .forEach(([key, distribution]) => {
      doc.moveDown();
      
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(formattedKey);
      
      doc.moveDown(0.5);
      
      // Create a table-like format
      Object.entries(distribution).forEach(([category, count], index) => {
        const fillColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        
        doc.rect(50, doc.y, 500, 25)
           .fill(fillColor);
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(category, 60, doc.y - 20, { width: 250, continued: true })
           .font('Helvetica')
           .text(`${count}`, { align: 'right' });
      });
      
      doc.moveDown();
    });
  
  // Add footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer
    doc.fontSize(10)
       .text(
         'Blood Bank Management System - Confidential', 
         50, 
         doc.page.height - 50,
         { align: 'center' }
       );
    
    // Page number
    doc.text(
      `Page ${i + 1} of ${pageCount}`,
      50,
      doc.page.height - 30,
      { align: 'center' }
    );
  }
}

// Helper function to convert JSON to CSV
function convertToCSV(jsonData) {
  let csv = '';
  
  // Add report title and generation date
  csv += `${jsonData.title || 'Report'}\\n`;
  csv += `Generated at,${jsonData.generatedAt || new Date().toISOString()}\\n\\n`;
  
  // Convert the main report data
  const reportEntries = Object.entries(jsonData)
    .filter(([key]) => !['title', 'generatedAt'].includes(key) && typeof jsonData[key] !== 'object');
  
  if (reportEntries.length > 0) {
    csv += reportEntries.map(([key, value]) => `${key},${value}`).join('\\n') + '\\n\\n';
  }
  
  // Handle nested objects (distributions)
  Object.entries(jsonData)
    .filter(([key, value]) => typeof value === 'object' && value !== null)
    .forEach(([key, distribution]) => {
      csv += `${key}\\n`;
      csv += 'Category,Count\\n';
      Object.entries(distribution).forEach(([category, count]) => {
        csv += `${category},${count}\\n`;
      });
      csv += '\\n';
    });
  
  return csv;
}

// Mock function to generate inventory status report
async function generateInventoryStatusReport() {
  return {
    title: 'Blood Inventory Status',
    generatedAt: new Date().toISOString(),
    totalAvailable: 1234,
    criticalLevels: 3,
    expiringUnits: 28,
    storageCapacity: '78%',
    bloodTypeDistribution: {
      'A+': 320,
      'A-': 85,
      'B+': 280,
      'B-': 75,
      'AB+': 98,
      'AB-': 25,
      'O+': 300,
      'O-': 51
    }
  };
}

// Mock function to generate donation statistics report
async function generateDonationStatisticsReport() {
  return {
    title: 'Monthly Donation Statistics',
    generatedAt: new Date().toISOString(),
    period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    totalDonations: 245,
    totalDonors: 189,
    avgDonationsPerDay: 8.2,
    mostCommonBloodType: 'O+',
    percentageChange: '+5.2%' 
  };
}

// Mock function to generate donor demographics report
async function generateDonorDemographicsReport() {
  return {
    title: 'Donor Demographics',
    generatedAt: new Date().toISOString(),
    totalDonors: 1543,
    ageDistribution: {
      '18-25': 230,
      '26-35': 450,
      '36-45': 380,
      '46-55': 320,
      '56+': 163
    },
    genderDistribution: {
      'Male': 825,
      'Female': 718
    },
    bloodTypeDistribution: {
      'A+': 420,
      'A-': 95,
      'B+': 300,
      'B-': 85,
      'AB+': 120,
      'AB-': 35,
      'O+': 400,
      'O-': 88
    }
  };
}

// Mock function to generate expiry forecast report
async function generateExpiryForecastReport() {
  return {
    title: 'Blood Unit Expiry Forecast',
    generatedAt: new Date().toISOString(),
    expiringIn7Days: 28,
    expiringIn30Days: 92,
    expiryByBloodType: {
      'A+': 10,
      'A-': 3,
      'B+': 8,
      'B-': 2,
      'AB+': 5,
      'AB-': 1,
      'O+': 11,
      'O-': 2
    }
  };
}