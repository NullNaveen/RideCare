/**
 * index.ts
 * 
 * Firebase Cloud Functions entry point.
 * Exports all function handlers.
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Export function handlers
export { onTripCreated } from './onTripCreated';
export { onMaintenanceDue } from './onMaintenanceDue';
export { scheduledMaintenanceCheck } from './scheduledMaintenanceCheck';
