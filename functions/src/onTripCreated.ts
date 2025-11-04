/**
 * onTripCreated.ts
 * 
 * Cloud Function triggered when a new trip is created.
 * Updates bike odometer and checks if maintenance is due.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface Trip {
  id: string;
  bikeId: string;
  userId: string;
  distance: number;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
}

export const onTripCreated = functions.firestore
  .document('users/{userId}/trips/{tripId}')
  .onCreate(async (snapshot, context) => {
    const trip = snapshot.data() as Trip;
    const { userId } = context.params;

    try {
      const db = admin.firestore();

      // Update bike odometer
      const bikeRef = db
        .collection('users')
        .doc(userId)
        .collection('bikes')
        .doc(trip.bikeId);

      await bikeRef.update({
        odometer: admin.firestore.FieldValue.increment(trip.distance),
        lastTripAt: trip.endTime,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Get updated bike
      const bikeDoc = await bikeRef.get();
      const bike = bikeDoc.data();

      if (!bike) {
        console.error('Bike not found:', trip.bikeId);
        return;
      }

      // Check maintenance rules
      const maintenanceRules = await db
        .collection('users')
        .doc(userId)
        .collection('maintenance_rules')
        .get();

      const maintenanceHistory = await db
        .collection('users')
        .doc(userId)
        .collection('maintenance_events')
        .where('bikeId', '==', trip.bikeId)
        .get();

      const history = maintenanceHistory.docs.map(doc => doc.data());

      // Evaluate each rule
      for (const ruleDoc of maintenanceRules.docs) {
        const rule = ruleDoc.data();
        const isDue = evaluateRule(rule, bike.odometer, history);

        if (isDue) {
          // Send notification
          await sendMaintenanceNotification(userId, bike, rule);
        }
      }

      console.log('Trip processed successfully:', trip.id);
    } catch (error) {
      console.error('Error processing trip:', error);
      throw error;
    }
  });

// Helper function to evaluate maintenance rules
function evaluateRule(
  rule: any,
  currentOdometer: number,
  history: any[]
): boolean {
  // Find last completion
  const lastEvent = history
    .filter(event => event.ruleId === rule.id)
    .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis())[0];

  const baseOdometer = lastEvent?.odometer || 0;
  const baseDate = lastEvent?.completedAt?.toDate() || new Date(0);

  // Evaluate conditions
  for (const condition of rule.conditions) {
    if (condition.type === 'odometer') {
      const odometerSinceBase = currentOdometer - baseOdometer;
      if (odometerSinceBase >= condition.value) {
        return true;
      }
    } else if (condition.type === 'time') {
      const daysSinceBase = Math.floor(
        (Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceBase >= condition.value) {
        return true;
      }
    }
  }

  return false;
}

// Helper function to send FCM notification
async function sendMaintenanceNotification(
  userId: string,
  bike: any,
  rule: any
): Promise<void> {
  const db = admin.firestore();

  // Get user's FCM tokens
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  if (!user?.fcmTokens || user.fcmTokens.length === 0) {
    console.log('No FCM tokens for user:', userId);
    return;
  }

  // Send notification
  const message = {
    notification: {
      title: '🔧 Maintenance Due',
      body: `${rule.title} is due for your ${bike.name}`,
    },
    data: {
      type: 'maintenance_due',
      ruleId: rule.id,
      bikeId: bike.id,
    },
    tokens: user.fcmTokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log('Notification sent:', response.successCount, 'success');

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          tokensToRemove.push(user.fcmTokens[idx]);
        }
      });

      await db
        .collection('users')
        .doc(userId)
        .update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove),
        });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
