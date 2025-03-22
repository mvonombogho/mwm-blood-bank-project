import dbConnect from '../../../../lib/dbConnect';
import Report from '../../../../models/Report';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all reports
    case 'GET':
      try {
        // Get query parameters
        const { type, limit = 10, skip = 0, sort = '-createdAt' } = req.query;
        
        // Build query
        const query = {};
        
        // Filter by report type if specified
        if (type && type !== 'all') {
          query.type = type;
        }
        
        // Only show completed reports by default
        query.status = 'completed';
        
        // Execute query with pagination and sorting
        const reports = await Report.find(query)
          .sort(sort)
          .skip(parseInt(skip))
          .limit(parseInt(limit));
        
        // Get total count for pagination
        const total = await Report.countDocuments(query);
        
        // Format response with pagination metadata
        res.status(200).json({
          reports,
          pagination: {
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
            hasMore: total > (parseInt(skip) + parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
      }
      break;

    // POST - create a new report record
    case 'POST':
      try {
        // Extract data from request body
        const {
          title,
          type,
          format,
          timeRange,
          parameters = {},
          description
        } = req.body;
        
        // Validate required fields
        if (!title || !type || !format || !timeRange) {
          return res.status(400).json({
            message: 'Missing required fields',
            requiredFields: ['title', 'type', 'format', 'timeRange']
          });
        }
        
        // Generate a unique report ID
        const reportId = `RPT-${type.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        
        // Create the report record (initially in pending status)
        const report = await Report.create({
          reportId,
          title,
          type,
          format,
          timeRange,
          parameters,
          description,
          status: 'pending',
          createdBy: req.user.id
        });
        
        res.status(201).json(report);
      } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
      break;
  }
}

export default withAuth(handler, { requiredPermission: 'canViewReports' });