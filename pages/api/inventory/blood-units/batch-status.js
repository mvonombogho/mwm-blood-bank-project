import { connectToDatabase } from '../../../../lib/mongodb';
import BloodUnit from '../../../../models/BloodUnit';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    const { unitIds, status, notes } = req.body;

    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      return res.status(400).json({ message: 'Unit IDs array is required and must not be empty' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Create a status history entry to add to each blood unit
    const statusHistoryEntry = {
      status,
      date: new Date(),
      updatedBy: session.user.name || session.user.email,
      notes: notes || ''
    };

    // Update all blood units in the batch
    const updateResults = await BloodUnit.updateMany(
      { _id: { $in: unitIds } },
      {
        $set: { status },
        $push: { statusHistory: statusHistoryEntry }
      }
    );

    // Special handling for Expired status - update expiration date if needed
    if (status === 'Expired') {
      const currentDate = new Date();
      await BloodUnit.updateMany(
        { 
          _id: { $in: unitIds },
          expirationDate: { $gt: currentDate }
        },
        {
          $set: { expirationDate: currentDate }
        }
      );
    }

    // Get the updated blood units
    const updatedUnits = await BloodUnit.find({ _id: { $in: unitIds } }).lean();

    // Check if any units weren't found/updated
    const updatedUnitIds = updatedUnits.map(unit => unit._id.toString());
    const missingUnitIds = unitIds.filter(id => !updatedUnitIds.includes(id.toString()));

    return res.status(200).json({
      message: `Updated ${updateResults.modifiedCount} blood units`,
      unitsUpdated: updateResults.modifiedCount,
      unitsNotFound: missingUnitIds.length,
      missingUnitIds
    });
  } catch (error) {
    console.error('Error updating blood units batch status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
