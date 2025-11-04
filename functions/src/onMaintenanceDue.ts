/**
 * onMaintenanceDue.ts
 * 
 * Cloud Function triggered when maintenance is marked as due.
 * Sends push notifications to users.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onMaintenanceDue = functions.firestore
  .document('users/{userId}/maintenance_due/{maintenanceId}')
  .onCreate(async (snapshot, context) => {
    const maintenanceDue = snapshot.data();
    const { userId } = context.params;

    try {
      const db = admin.firestore();

      // Get user and bike info
      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.data();

      if (!user?.fcmTokens || user.fcmTokens.length === 0) {
        console.log('No FCM tokens for user:', userId);
        return;
      }

      const bikeDoc = await db
        .collection('users')
        .doc(userId)
        .collection('bikes')
        .doc(maintenanceDue.bikeId)
        .get();

      const bike = bikeDoc.data();

      // Determine urgency
      const urgency = maintenanceDue.status === 'overdue' ? '🚨 OVERDUE' : '⚠️ Due Soon';

      // Send notification
      const message = {
        notification: {
          title: `${urgency}: ${maintenanceDue.title}`,
          body: `${bike?.name || 'Your bike'}: ${maintenanceDue.description}`,
        },
        data: {
          type: 'maintenance_due',
          ruleId: maintenanceDue.ruleId,
          bikeId: maintenanceDue.bikeId,
          status: maintenanceDue.status,
        },
        tokens: user.fcmTokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log('Maintenance notification sent:', response.successCount);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
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
      console.error('Error sending maintenance notification:', error);
      throw error;
    }
  });
