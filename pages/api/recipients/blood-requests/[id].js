import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';

export default async function handler(req, res) {
  const {
    query: { id }, // This is the request ID
    method,
  } = req;

  await dbConnect();

  // Find the recipient that has the specific blood request
  const recipient = await Recipient.findOne({ 'bloodRequests.requestId': id });

  if (!recipient) {
    return res.status(404).json({ success: false, error: 'Blood request not found' });
  }

  // Find the specific blood request in the recipient
  const bloodRequest = recipient.bloodRequests.find(
    request => request.requestId === id
  );

  if (!bloodRequest) {
    return res.status(404).json({ success: false, error: 'Blood request not found' });
  }

  switch (method) {
    // GET blood request by ID
    case 'GET':
      try {
        // Return the blood request with recipient information
        res.status(200).json({
          success: true,
          data: {
            ...bloodRequest.toObject(),
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

    // PUT (update) blood request
    case 'PUT':
      try {
        // Find the index of the blood request to update
        const requestIndex = recipient.bloodRequests.findIndex(
          request => request.requestId === id
        );
        
        if (requestIndex === -1) {
          return res.status(404).json({ success: false, error: 'Blood request not found' });
        }

        // Update the blood request
        const updatedRequest = { ...bloodRequest.toObject(), ...req.body };
        recipient.bloodRequests[requestIndex] = updatedRequest;
        
        await recipient.save();

        // Return the updated blood request with recipient information
        res.status(200).json({
          success: true,
          data: {
            ...recipient.bloodRequests[requestIndex].toObject(),
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

    // DELETE blood request
    case 'DELETE':
      try {
        // Remove the blood request from the recipient
        recipient.bloodRequests = recipient.bloodRequests.filter(
          request => request.requestId !== id
        );
        
        await recipient.save();
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}