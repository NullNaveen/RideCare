/**
 * MaintenanceEngine.test.ts
 * 
 * Unit tests for MaintenanceEngine service
 */

import MaintenanceEngine, { MaintenanceEvent, MaintenanceRule } from '../services/MaintenanceEngine';

describe('MaintenanceEngine', () => {
  beforeEach(() => {
    // Reset to defaults before each test
    MaintenanceEngine.resetToDefaults();
  });

  describe('evaluateRules', () => {
    it('should return empty array when no maintenance is due', () => {
      const currentOdometer = 1000;
      const history: MaintenanceEvent[] = [];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      expect(dueItems).toEqual([]);
    });

    it('should detect oil change due at 3000 km', () => {
      const currentOdometer = 3000;
      const history: MaintenanceEvent[] = [];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      const oilChange = dueItems.find(item => item.rule.type === 'oil');
      expect(oilChange).toBeDefined();
      expect(oilChange?.status).toBe('due');
    });

    it('should detect upcoming maintenance within 500 km', () => {
      const currentOdometer = 2600; // 400 km before oil change
      const history: MaintenanceEvent[] = [];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      const oilChange = dueItems.find(item => item.rule.type === 'oil');
      expect(oilChange).toBeDefined();
      expect(oilChange?.status).toBe('upcoming');
      expect(oilChange?.kmUntilDue).toBe(400);
    });

    it('should detect overdue maintenance', () => {
      const currentOdometer = 4000; // 1000 km overdue
      const history: MaintenanceEvent[] = [];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      const oilChange = dueItems.find(item => item.rule.type === 'oil');
      expect(oilChange).toBeDefined();
      expect(oilChange?.status).toBe('overdue');
    });

    it('should respect last maintenance completion', () => {
      const currentOdometer = 5000;
      const history: MaintenanceEvent[] = [
        {
          id: 'evt1',
          ruleId: 'rule_oil_change',
          bikeId: 'bike1',
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          odometer: 3500, // Completed at 3500 km
        },
      ];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      const oilChange = dueItems.find(item => item.rule.type === 'oil');
      expect(oilChange?.kmUntilDue).toBe(1500); // 3000 km interval - 1500 km traveled
    });

    it('should sort by priority and status', () => {
      const currentOdometer = 10000; // Multiple items due
      const history: MaintenanceEvent[] = [];

      const dueItems = MaintenanceEngine.evaluateRules(currentOdometer, history);

      // First item should be highest priority
      expect(dueItems[0].priority).toBeGreaterThanOrEqual(dueItems[1]?.priority || 0);
    });
  });

  describe('addRule and removeRule', () => {
    it('should add a custom rule', () => {
      const customRule: MaintenanceRule = {
        id: 'custom_rule_1',
        type: 'custom',
        title: 'Custom Maintenance',
        description: 'Test rule',
        conditions: [{ type: 'odometer', operator: 'gte', value: 1000 }],
        recurrence: 'once',
        priority: 50,
      };

      MaintenanceEngine.addRule(customRule);
      const rules = MaintenanceEngine.getRules();

      expect(rules).toContainEqual(customRule);
    });

    it('should remove a rule by ID', () => {
      MaintenanceEngine.removeRule('rule_oil_change');
      const rules = MaintenanceEngine.getRules();

      const oilRule = rules.find(r => r.id === 'rule_oil_change');
      expect(oilRule).toBeUndefined();
    });
  });

  describe('predictNextMaintenance', () => {
    it('should predict next maintenance date and odometer', () => {
      const rule = MaintenanceEngine.getRules().find(r => r.id === 'rule_oil_change')!;
      const averageKmPerDay = 50;
      const currentOdometer = 1000;

      const prediction = MaintenanceEngine.predictNextMaintenance(
        rule,
        averageKmPerDay,
        currentOdometer
      );

      expect(prediction).not.toBeNull();
      expect(prediction?.predictedOdometer).toBe(4000); // 1000 + 3000
      // 3000 km / 50 km/day = 60 days from now
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 60);
      expect(prediction?.predictedDate.getDate()).toBe(expectedDate.getDate());
    });
  });
});
