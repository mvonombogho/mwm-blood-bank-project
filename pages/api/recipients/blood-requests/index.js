import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all blood requests
    case 'GET':
      try {
        const { recipientId, status, urgency } = req.query;
        
        // Build the query based on provided parameters
        let query = {};
        
        // If recipientId is provided, filter by this recipient
        if (recipientId) {
          if (mongoose.Types.ObjectId.isValid(recipientId)) {
            query = { _id: recipientId };
          } else {
            query = { recipientId: recipientId };
          }
        }
        
        // Get recipients and their blood requests based on query
        const recipients = await Recipient.find(query);
        
        // Extract blood requests from all recipients
        let allRequests = [];
        recipients.forEach(recipient => {
          if (recipient.bloodRequests && recipient.bloodRequests.length > 0) {
            // Add recipient info to each blood request
            const requestsWithRecipientInfo = recipient.bloodRequests.map(request => {
              // Filter by status and urgency if provided
              if ((status && request.status !== status) || 
                  (urgency && request.urgency !== urgency)) {
                return null;
              }
              
              return {
                ...request.toObject(),
                recipient: {
                  _id: recipient._id,
                  recipientId: recipient.recipientId,
                  firstName: recipient.firstName,
                  lastName: recipient.lastName,
                  bloodType: recipient.bloodType
                }
              };
            }).filter(Boolean); // Remove null entries
            
            allRequests = allRequests.concat(requestsWithRecipientInfo);
          }
        });
        
        res.status(200).json({ success: true, data: allRequests });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new blood request
    case 'POST':
      try {
        const { recipientId, requestData } = req.body;
        
        if (!recipientId || !requestData) {
          return res.status(400).json({ 
            success: false, 
            error: 'Both recipientId and requestData are required' 
          });
        }
        
        // Find the recipient
        let recipient;
        if (mongoose.Types.ObjectId.isValid(recipientId)) {
          recipient = await Recipient.findById(recipientId);
        } else {
          recipient = await Recipient.findOne({ recipientId: recipientId });
        }
        
        if (!recipient) {
          return res.status(404).json({ 
            success: false, 
            error: 'Recipient not found' 
          });
        }
        
        // Generate a unique request ID if not provided
        if (!requestData.requestId) {
          const date = new Date();
          const year = date.getFullYear().toString().slice(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const count = (recipient.bloodRequests?.length || 0) + 1;
          requestData.requestId = `BR${year}${month}${day}${count.toString().padStart(3, '0')}`;
        }
        
        // Add the blood request to the recipient
        recipient.bloodRequests.push(requestData);
        await recipient.save();
        
        // Get the newly added blood request
        const newRequest = recipient.bloodRequests[recipient.bloodRequests.length - 1];
        
        res.status(201).json({ 
          success: true, 
          data: {
            ...newRequest.toObject(),
            recipient: {
              _id: recipient._id,
              recipientId: recipient.recipientId,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              bloodType: recipient.bloodType
            }
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}