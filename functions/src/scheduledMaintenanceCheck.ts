/**
 * scheduledMaintenanceCheck.ts
 * 
 * Cloud Function that runs daily to check for maintenance due dates.
 * Scheduled via Firebase Cloud Scheduler.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const scheduledMaintenanceCheck = functions.pubsub
  .schedule('0 9 * * *') // Run daily at 9 AM UTC
  .timeZone('Asia/Kolkata') // IST
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get();

      let notificationsSent = 0;
      let usersProcessed = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const user = userDoc.data();

        // Skip users without FCM tokens
        if (!user.fcmTokens || user.fcmTokens.length === 0) {
          continue;
        }

        // Get user's bikes
        const bikesSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('bikes')
          .get();

        for (const bikeDoc of bikesSnapshot.docs) {
          const bike = bikeDoc.data();
          const bikeId = bikeDoc.id;

          // Get maintenance rules
          const rulesSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('maintenance_rules')
            .get();

          // Get maintenance history
          const historySnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('maintenance_events')
            .where('bikeId', '==', bikeId)
            .get();

          const history = historySnapshot.docs.map((doc: any) => doc.data());

          // Evaluate each rule
          for (const ruleDoc of rulesSnapshot.docs) {
            const rule = ruleDoc.data();

            // Check if maintenance is due
            const { isDue, daysUntilDue, kmUntilDue } = evaluateMaintenanceRule(
              rule,
              bike.odometer,
              history
            );

            // Send notification if due soon (within 3 days or 300 km)
            if (
              isDue ||
              (daysUntilDue !== null && daysUntilDue <= 3) ||
              (kmUntilDue !== null && kmUntilDue <= 300)
            ) {
              await sendReminderNotification(userId, bike, rule, {
                isDue,
                daysUntilDue,
                kmUntilDue,
              });
              notificationsSent++;
            }
          }
        }

        usersProcessed++;
      }

      console.log(
        `Scheduled maintenance check complete: ${usersProcessed} users, ${notificationsSent} notifications sent`
      );
    } catch (error) {
      console.error('Error in scheduled maintenance check:', error);
      throw error;
    }
  });

// Helper function to evaluate maintenance rules
function evaluateMaintenanceRule(
  rule: any,
  currentOdometer: number,
  history: any[]
): { isDue: boolean; daysUntilDue: number | null; kmUntilDue: number | null } {
  const lastEvent = history
    .filter((event: any) => event.ruleId === rule.id)
    .sort((a: any, b: any) => b.completedAt.toMillis() - a.completedAt.toMillis())[0];

  const baseOdometer = lastEvent?.odometer || 0;
  const baseDate = lastEvent?.completedAt?.toDate() || new Date(0);

  let isDue = false;
  let daysUntilDue: number | null = null;
  let kmUntilDue: number | null = null;

  for (const condition of rule.conditions) {
    if (condition.type === 'odometer') {
      const odometerSinceBase = currentOdometer - baseOdometer;
      kmUntilDue = condition.value - odometerSinceBase;

      if (odometerSinceBase >= condition.value) {
        isDue = true;
      }
    } else if (condition.type === 'time') {
      const daysSinceBase = Math.floor(
        (Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysUntilDue = condition.value - daysSinceBase;

      if (daysSinceBase >= condition.value) {
        isDue = true;
      }
    }
  }

  return { isDue, daysUntilDue, kmUntilDue };
}

// Helper function to send reminder notification
async function sendReminderNotification(
  userId: string,
  bike: any,
  rule: any,
  status: { isDue: boolean; daysUntilDue: number | null; kmUntilDue: number | null }
): Promise<void> {
  const db = admin.firestore();

  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  if (!user?.fcmTokens || user.fcmTokens.length === 0) {
    return;
  }

  // Build message body
  let body = `${bike.name}: ${rule.description}`;
  if (status.isDue) {
    body = `⚠️ NOW: ${body}`;
  } else if (status.daysUntilDue !== null && status.daysUntilDue <= 3) {
    body = `📅 In ${status.daysUntilDue} days: ${body}`;
  } else if (status.kmUntilDue !== null && status.kmUntilDue <= 300) {
    body = `📍 In ${status.kmUntilDue} km: ${body}`;
  }

  const message = {
    notification: {
      title: status.isDue ? '🚨 Maintenance Overdue' : '⏰ Maintenance Reminder',
      body,
    },
    data: {
      type: 'maintenance_reminder',
      ruleId: rule.id,
      bikeId: bike.id,
    },
    tokens: user.fcmTokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`Reminder sent to ${userId}: ${response.successCount} success`);

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
    console.error('Error sending reminder:', error);
  }
}
