import { connectToDatabase } from '../../../../../lib/mongodb';
import BloodUnit from '../../../../../models/BloodUnit';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the blood unit
    const bloodUnit = await BloodUnit.findById(id);
    if (!bloodUnit) {
      return res.status(404).json({ message: 'Blood unit not found' });
    }

    // Create a new status history entry
    const statusHistoryEntry = {
      status,
      date: new Date(),
      updatedBy: session.user.name || session.user.email,
      notes: notes || ''
    };

    // Update the blood unit with new status and add to history
    const updatedBloodUnit = await BloodUnit.findByIdAndUpdate(
      id,
      {
        status,
        $push: { statusHistory: statusHistoryEntry }
      },
      { new: true }
    );

    // Special handling for Expired status - update expiration date if needed
    if (status === 'Expired' && bloodUnit.expirationDate > new Date()) {
      updatedBloodUnit.expirationDate = new Date();
      await updatedBloodUnit.save();
    }

    return res.status(200).json(updatedBloodUnit);
  } catch (error) {
    console.error('Error updating blood unit status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
