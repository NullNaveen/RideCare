/**
 * DataExporter.ts
 * 
 * Utility for exporting user data (trips, maintenance) to CSV/JSON
 * For GDPR compliance and data portability
 */

import { Trip, MaintenanceRecord } from '../types';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

interface ExportOptions {
  format: 'csv' | 'json';
  includeTrips: boolean;
  includeMaintenance: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class DataExporterClass {
  /**
   * Export trips to CSV format
   */
  private exportTripsToCSV(trips: Trip[]): string {
    const headers = [
      'ID',
      'Start Time',
      'End Time',
      'Distance (km)',
      'Duration (min)',
      'Avg Speed (km/h)',
      'Max Speed (km/h)',
      'Start Location',
      'End Location'
    ];

    const rows = trips.map(trip => [
      trip.id,
      new Date(trip.startTime).toISOString(),
      new Date(trip.endTime).toISOString(),
      trip.distance.toFixed(2),
      Math.round(trip.duration / 60),
      trip.avgSpeed.toFixed(1),
      trip.maxSpeed.toFixed(1),
      `"${trip.startLocation.latitude},${trip.startLocation.longitude}"`,
      `"${trip.endLocation.latitude},${trip.endLocation.longitude}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Export maintenance records to CSV format
   */
  private exportMaintenanceToCSV(records: MaintenanceRecord[]): string {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Title',
      'Odometer (km)',
      'Cost (₹)',
      'Notes',
      'Receipt URL'
    ];

    const rows = records.map(record => [
      record.id,
      new Date(record.date).toISOString(),
      record.type,
      `"${record.title}"`,
      record.odometer,
      record.cost || 0,
      `"${record.notes || ''}"`,
      record.receiptUrl || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Export data based on options
   */
  async exportData(
    trips: Trip[],
    maintenance: MaintenanceRecord[],
    options: ExportOptions
  ): Promise<{ filePath: string }> {
    // Filter by date range if specified
    let filteredTrips = trips;
    let filteredMaintenance = maintenance;

    if (options.dateRange) {
      const { start, end } = options.dateRange;
      
      filteredTrips = trips.filter(
        trip =>
          trip.startTime >= start.getTime() &&
          trip.startTime <= end.getTime()
      );

      filteredMaintenance = maintenance.filter(
        record =>
          record.date >= start.getTime() &&
          record.date <= end.getTime()
      );
    }

    // Generate export content
    let content: string;
    let fileName: string;

    if (options.format === 'csv') {
      const parts: string[] = [];

      if (options.includeTrips && filteredTrips.length > 0) {
        parts.push('# TRIPS\n' + this.exportTripsToCSV(filteredTrips));
      }

      if (options.includeMaintenance && filteredMaintenance.length > 0) {
        parts.push('# MAINTENANCE\n' + this.exportMaintenanceToCSV(filteredMaintenance));
      }

      content = parts.join('\n\n');
      fileName = `ridecare_export_${Date.now()}.csv`;
    } else {
      // JSON format
      const data: any = {};

      if (options.includeTrips) {
        data.trips = filteredTrips;
      }

      if (options.includeMaintenance) {
        data.maintenance = filteredMaintenance;
      }

      data.exportedAt = new Date().toISOString();

      content = JSON.stringify(data, null, 2);
      fileName = `ridecare_export_${Date.now()}.json`;
    }

    // Write to temporary file
    const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, content, 'utf8');

    return { filePath };
  }

  /**
   * Export and share data
   */
  async exportAndShare(
    trips: Trip[],
    maintenance: MaintenanceRecord[],
    options: ExportOptions
  ): Promise<void> {
    try {
      const { filePath } = await this.exportData(trips, maintenance, options);

      await Share.open({
        url: `file://${filePath}`,
        type: options.format === 'csv' ? 'text/csv' : 'application/json',
        title: 'Export RideCare Data'
      });

      // Clean up after sharing
      setTimeout(() => {
        RNFS.unlink(filePath).catch(console.error);
      }, 5000);
    } catch (error) {
      if ((error as any).message !== 'User did not share') {
        throw error;
      }
    }
  }

  /**
   * Export all user data (GDPR data portability)
   */
  async exportAllData(userId: string): Promise<{ filePath: string }> {
    // Fetch all user data from Firestore
    // This would be implemented with proper Firestore queries
    const trips: Trip[] = [];
    const maintenance: MaintenanceRecord[] = [];

    return this.exportData(trips, maintenance, {
      format: 'json',
      includeTrips: true,
      includeMaintenance: true
    });
  }
}

const DataExporter = new DataExporterClass();
export default DataExporter;
