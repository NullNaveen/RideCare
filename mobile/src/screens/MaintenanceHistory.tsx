/**
 * MaintenanceHistory.tsx
 * 
 * Complete maintenance history with filters, search, and export.
 * Shows all past maintenance events with costs, receipts, and notes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';

interface MaintenanceEvent {
  id: string;
  ruleId: string;
  type: 'oil' | 'chain' | 'tyre' | 'service' | 'brake' | 'battery' | 'custom';
  title: string;
  completedAt: string;
  odometer: number;
  cost?: number;
  notes?: string;
  receiptUrl?: string;
}

interface MaintenanceHistoryProps {
  navigation: any;
}

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ navigation }) => {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MaintenanceEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Load maintenance history from database
    loadMaintenanceHistory();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...events];

    // Filter by type
    if (filterType) {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt).getTime();
      const dateB = new Date(b.completedAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, filterType, sortOrder]);

  const loadMaintenanceHistory = () => {
    // Mock data - replace with database query
    const mockEvents: MaintenanceEvent[] = [
      {
        id: '1',
        ruleId: 'rule_oil_change',
        type: 'oil',
        title: 'Engine Oil Change',
        completedAt: '2025-10-15T10:30:00Z',
        odometer: 5500,
        cost: 800,
        notes: 'Used Castrol 10W-40',
      },
      {
        id: '2',
        ruleId: 'rule_chain_lube',
        type: 'chain',
        title: 'Chain Lubrication',
        completedAt: '2025-09-20T14:15:00Z',
        odometer: 5000,
        cost: 150,
      },
      {
        id: '3',
        ruleId: 'rule_tyre_rotation',
        type: 'tyre',
        title: 'Tyre Pressure Check',
        completedAt: '2025-08-10T09:00:00Z',
        odometer: 4200,
        notes: 'Front: 32 PSI, Rear: 36 PSI',
      },
    ];
    setEvents(mockEvents);
  };

  const calculateTotalCost = (): number => {
    return filteredEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
    }).format(new Date(dateString));
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      oil: '🛢️',
      chain: '⛓️',
      tyre: '🛞',
      service: '🔧',
      brake: '🛑',
      battery: '🔋',
      custom: '📝',
    };
    return icons[type] || '📝';
  };

  const renderEvent = ({ item }: { item: MaintenanceEvent }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('MaintenanceDetail', { event: item })}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleRow}>
          <Text style={styles.eventIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{formatDate(item.completedAt)}</Text>
          </View>
        </View>
        {item.cost !== undefined && (
          <Text style={styles.eventCost}>₹{item.cost}</Text>
        )}
      </View>
      
      <View style={styles.eventDetails}>
        <Text style={styles.eventOdometer}>📍 {item.odometer.toLocaleString()} km</Text>
        {item.notes && (
          <Text style={styles.eventNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
      
      {item.receiptUrl && (
        <View style={styles.receiptIndicator}>
          <Text style={styles.receiptText}>📎 Receipt attached</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilters = () => {
    const types = ['oil', 'chain', 'tyre', 'service', 'brake', 'battery'];
    
    return (
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filterType && styles.filterChipActive]}
          onPress={() => setFilterType(null)}
        >
          <Text style={[styles.filterChipText, !filterType && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        
        {types.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filterType === type && styles.filterChipActive]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === type && styles.filterChipTextActive,
              ]}
            >
              {getTypeIcon(type)} {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search maintenance..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9E9E9E"
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Text style={styles.sortButtonText}>
            {sortOrder === 'desc' ? '🔽' : '🔼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredEvents.length} events • ₹{calculateTotalCost().toLocaleString()} total
        </Text>
      </View>

      {/* Event List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No maintenance records found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddMaintenance')}
            >
              <Text style={styles.addButtonText}>+ Add First Record</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      {filteredEvents.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddMaintenance')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#757575',
  },
  eventCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  eventDetails: {
    marginBottom: 8,
  },
  eventOdometer: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  eventNotes: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  receiptIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  receiptText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#2196F3',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default MaintenanceHistory;
