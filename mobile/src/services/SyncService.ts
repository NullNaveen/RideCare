/**
 * SyncService.ts
 * 
 * Offline-first sync service for bi-directional sync between SQLite and Firestore.
 * Implements last-write-wins conflict resolution with timestamp-based versioning.
 * 
 * Features:
 * - Offline queue for pending changes
 * - Network state monitoring
 * - Batch sync on reconnect
 * - Conflict resolution (last-write-wins)
 * - Incremental sync with watermarks
 */

import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

export interface SyncState {
  lastSyncAt: Date | null;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

type SyncListener = (state: SyncState) => void;

class SyncService {
  private database: Database | null = null;
  private userId: string | null = null;
  private isOnline = false;
  private isSyncing = false;
  private lastSyncAt: Date | null = null;
  private syncQueue: any[] = [];
  private listeners: SyncListener[] = [];
  private netInfoUnsubscribe: (() => void) | null = null;

  /**
   * Initialize sync service with user and database
   */
  public async initialize(userId: string, database: Database): Promise<void> {
    this.userId = userId;
    this.database = database;

    // Load last sync timestamp from local storage
    // (In production, store this in a metadata table)
    this.lastSyncAt = null;

    // Listen to network state
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;

      // Trigger sync when coming online
      if (!wasOnline && this.isOnline) {
        console.log('Network restored, triggering sync');
        this.sync();
      }

      this.notifyListeners();
    });

    // Check initial network state
    const netState = await NetInfo.fetch();
    this.isOnline = netState.isConnected || false;

    // Perform initial sync if online
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }

  /**
   * Perform bi-directional sync
   */
  public async sync(): Promise<void> {
    if (!this.userId || !this.database || !this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      // Step 1: Push local changes to Firestore
      await this.pushLocalChanges();

      // Step 2: Pull remote changes from Firestore
      await this.pullRemoteChanges();

      // Step 3: Update last sync timestamp
      this.lastSyncAt = new Date();
      this.notifyListeners();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Push local changes to Firestore
   */
  private async pushLocalChanges(): Promise<void> {
    if (!this.database || !this.userId) return;

    // Get all dirty (modified) records
    // Note: WatermelonDB tracks changes with _status field
    const collections = ['bikes', 'trips', 'maintenance_events'];

    for (const collectionName of collections) {
      const collection = this.database.get(collectionName);
      
      // Query for dirty records (created or updated locally)
      // This is a simplified example - real implementation would track sync status
      const dirtyRecords = await collection.query().fetch();

      for (const record of dirtyRecords) {
        const data = record._raw;
        const docRef = firestore()
          .collection('users')
          .doc(this.userId)
          .collection(collectionName)
          .doc(data.id);

        try {
          await docRef.set(
            {
              ...data,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          // Mark record as synced in local DB
          // (In production, you'd update a sync metadata table)
        } catch (error) {
          console.error(`Failed to push ${collectionName}/${data.id}:`, error);
        }
      }
    }
  }

  /**
   * Pull remote changes from Firestore
   */
  private async pullRemoteChanges(): Promise<void> {
    if (!this.database || !this.userId) return;

    const collections = ['bikes', 'trips', 'maintenance_events'];

    for (const collectionName of collections) {
      try {
        // Query for documents updated since last sync
        let query = firestore()
          .collection('users')
          .doc(this.userId)
          .collection(collectionName);

        if (this.lastSyncAt) {
          query = query.where('updatedAt', '>', this.lastSyncAt);
        }

        const snapshot = await query.get();

        for (const doc of snapshot.docs) {
          const remoteData = doc.data();
          await this.mergeRemoteRecord(collectionName, remoteData);
        }
      } catch (error) {
        console.error(`Failed to pull ${collectionName}:`, error);
      }
    }
  }

  /**
   * Merge remote record with local database (conflict resolution)
   */
  private async mergeRemoteRecord(
    collectionName: string,
    remoteData: any
  ): Promise<void> {
    if (!this.database) return;

    const collection = this.database.get(collectionName);

    try {
      // Find local record by ID
      const localRecord = await collection.find(remoteData.id);

      // Compare timestamps (last-write-wins)
      const localUpdatedAt = new Date(localRecord._raw.updated_at || 0);
      const remoteUpdatedAt = remoteData.updatedAt?.toDate() || new Date(0);

      if (remoteUpdatedAt > localUpdatedAt) {
        // Remote is newer, update local
        await this.database.write(async () => {
          await localRecord.update(record => {
            Object.assign(record._raw, remoteData);
          });
        });
      } else {
        // Local is newer or equal, keep local (will be pushed on next sync)
        console.log(`Local record ${remoteData.id} is newer, keeping local`);
      }
    } catch (error) {
      // Record doesn't exist locally, create it
      await this.database.write(async () => {
        await collection.create(record => {
          Object.assign(record._raw, remoteData);
        });
      });
    }
  }

  /**
   * Add a change to sync queue (for immediate sync attempts)
   */
  public queueChange(collection: string, recordId: string, action: 'create' | 'update' | 'delete'): void {
    this.syncQueue.push({ collection, recordId, action, timestamp: new Date() });

    // Attempt immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      this.sync();
    }
  }

  /**
   * Force sync (called manually by user)
   */
  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    await this.sync();
  }

  /**
   * Get current sync state
   */
  public getState(): SyncState {
    return {
      lastSyncAt: this.lastSyncAt,
      pendingChanges: this.syncQueue.length,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Subscribe to sync state changes
   */
  public addListener(callback: SyncListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Clear all local data (logout)
   */
  public async clearLocalData(): Promise<void> {
    if (!this.database) return;

    await this.database.write(async () => {
      await this.database!.unsafeResetDatabase();
    });

    this.lastSyncAt = null;
    this.syncQueue = [];
    this.notifyListeners();
  }
}

export default new SyncService();
