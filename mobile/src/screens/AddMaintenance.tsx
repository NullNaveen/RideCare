/**
 * AddMaintenance.tsx
 * 
 * Form to log completed maintenance with odometer, cost, notes, and receipt photo.
 * Supports selecting from predefined rules or creating custom maintenance.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface MaintenanceRule {
  id: string;
  type: string;
  title: string;
}

interface AddMaintenanceProps {
  navigation: any;
}

const AddMaintenance: React.FC<AddMaintenanceProps> = ({ navigation }) => {
  const [selectedRule, setSelectedRule] = useState<MaintenanceRule | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedRules: MaintenanceRule[] = [
    { id: 'rule_oil_change', type: 'oil', title: 'Engine Oil Change' },
    { id: 'rule_chain_lube', type: 'chain', title: 'Chain Lubrication' },
    { id: 'rule_tyre_rotation', type: 'tyre', title: 'Tyre Maintenance' },
    { id: 'rule_service_6k', type: 'service', title: 'General Service' },
    { id: 'rule_brake_pads', type: 'brake', title: 'Brake Inspection' },
    { id: 'rule_battery_check', type: 'battery', title: 'Battery Check' },
  ];

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (result.assets && result.assets[0].uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Receipt', 'Are you sure you want to remove the receipt photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setReceiptUri(null) },
    ]);
  };

  const validateForm = (): boolean => {
    if (!selectedRule && !customTitle.trim()) {
      Alert.alert('Error', 'Please select a maintenance type or enter a custom title');
      return false;
    }

    if (!odometer.trim()) {
      Alert.alert('Error', 'Please enter the odometer reading');
      return false;
    }

    const odometerValue = parseInt(odometer);
    if (isNaN(odometerValue) || odometerValue < 0) {
      Alert.alert('Error', 'Please enter a valid odometer reading');
      return false;
    }

    if (cost.trim() && (isNaN(parseFloat(cost)) || parseFloat(cost) < 0)) {
      Alert.alert('Error', 'Please enter a valid cost');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create maintenance event
      const maintenanceEvent = {
        id: `maint_${Date.now()}`,
        ruleId: selectedRule?.id || 'custom',
        type: selectedRule?.type || 'custom',
        title: selectedRule?.title || customTitle,
        completedAt: new Date().toISOString(),
        odometer: parseInt(odometer),
        cost: cost ? parseFloat(cost) : undefined,
        notes: notes.trim() || undefined,
        receiptUrl: receiptUri || undefined,
      };

      // Save to database (implement in production)
      console.log('Saving maintenance event:', maintenanceEvent);

      // Show success message
      Alert.alert('Success', 'Maintenance logged successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save maintenance:', error);
      Alert.alert('Error', 'Failed to save maintenance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Maintenance Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance Type</Text>
        <View style={styles.rulesGrid}>
          {predefinedRules.map(rule => (
            <TouchableOpacity
              key={rule.id}
              style={[
                styles.ruleCard,
                selectedRule?.id === rule.id && styles.ruleCardSelected,
              ]}
              onPress={() => {
                setSelectedRule(rule);
                setCustomTitle('');
              }}
            >
              <Text style={styles.ruleTitle}>{rule.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.orText}>OR</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Custom maintenance (e.g., Spark plug replacement)"
          value={customTitle}
          onChangeText={text => {
            setCustomTitle(text);
            if (text.trim()) setSelectedRule(null);
          }}
          placeholderTextColor="#9E9E9E"
        />
      </View>

      {/* Odometer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Odometer Reading *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter current odometer (km)"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="number-pad"
          placeholderTextColor="#9E9E9E"
        />
      </View>

      {/* Cost */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter cost (₹)"
          value={cost}
          onChangeText={setCost}
          keyboardType="decimal-pad"
          placeholderTextColor="#9E9E9E"
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add notes (e.g., parts used, mechanic name)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#9E9E9E"
        />
      </View>

      {/* Receipt Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receipt Photo (Optional)</Text>
        {receiptUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: receiptUri }} style={styles.receiptImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
            <Text style={styles.uploadButtonText}>📷 Add Receipt Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Maintenance'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ruleCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  ruleCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  ruleTitle: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9E9E9E',
    marginVertical: 16,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  uploadButton: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AddMaintenance;
