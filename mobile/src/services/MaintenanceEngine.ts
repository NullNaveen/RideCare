/**
 * MaintenanceEngine.ts
 * 
 * Rule-based maintenance tracking engine that evaluates when service is due
 * based on odometer, time elapsed, and custom rules.
 * 
 * Features:
 * - Multi-condition rules (OR/AND logic)
 * - Time-based and distance-based triggers
 * - Priority scoring (0-100)
 * - Notification scheduling
 * - Predictive maintenance (Pro feature)
 */

import { differenceInDays, parseISO } from 'date-fns';

export interface MaintenanceRule {
  id: string;
  type: 'oil' | 'chain' | 'tyre' | 'service' | 'brake' | 'battery' | 'custom';
  title: string;
  description: string;
  conditions: MaintenanceCondition[];
  recurrence: 'once' | 'recurring';
  priority: number; // 0-100
}

export interface MaintenanceCondition {
  type: 'odometer' | 'time';
  operator: 'gte' | 'lte' | 'eq';
  value: number; // km for odometer, days for time
  logic?: 'OR' | 'AND'; // How to combine with next condition
}

export interface MaintenanceEvent {
  id: string;
  ruleId: string;
  bikeId: string;
  completedAt: string; // ISO date
  odometer: number; // km at completion
  cost?: number;
  notes?: string;
  receiptUrl?: string;
}

export interface MaintenanceDue {
  rule: MaintenanceRule;
  status: 'upcoming' | 'due' | 'overdue';
  daysUntilDue: number | null; // null if distance-based only
  kmUntilDue: number | null; // null if time-based only
  priority: number; // 0-100
  lastCompleted?: MaintenanceEvent;
}

// Default maintenance rules for Indian bikes
const DEFAULT_RULES: MaintenanceRule[] = [
  {
    id: 'rule_oil_change',
    type: 'oil',
    title: 'Engine Oil Change',
    description: 'Replace engine oil and filter',
    conditions: [
      { type: 'odometer', operator: 'gte', value: 3000, logic: 'OR' },
      { type: 'time', operator: 'gte', value: 90 }, // 3 months
    ],
    recurrence: 'recurring',
    priority: 90,
  },
  {
    id: 'rule_chain_lube',
    type: 'chain',
    title: 'Chain Lubrication',
    description: 'Clean and lubricate drive chain',
    conditions: [
      { type: 'odometer', operator: 'gte', value: 500, logic: 'OR' },
      { type: 'time', operator: 'gte', value: 14 }, // 2 weeks
    ],
    recurrence: 'recurring',
    priority: 60,
  },
  {
    id: 'rule_tyre_rotation',
    type: 'tyre',
    title: 'Tyre Rotation & Pressure Check',
    description: 'Rotate tyres and check pressure/tread depth',
    conditions: [
      { type: 'odometer', operator: 'gte', value: 5000, logic: 'OR' },
      { type: 'time', operator: 'gte', value: 120 }, // 4 months
    ],
    recurrence: 'recurring',
    priority: 70,
  },
  {
    id: 'rule_service_6k',
    type: 'service',
    title: '6000 km Service',
    description: 'Comprehensive service (spark plug, air filter, brake check)',
    conditions: [{ type: 'odometer', operator: 'gte', value: 6000 }],
    recurrence: 'recurring',
    priority: 95,
  },
  {
    id: 'rule_brake_pads',
    type: 'brake',
    title: 'Brake Pad Inspection',
    description: 'Check brake pad wear and replace if needed',
    conditions: [
      { type: 'odometer', operator: 'gte', value: 8000, logic: 'OR' },
      { type: 'time', operator: 'gte', value: 180 }, // 6 months
    ],
    recurrence: 'recurring',
    priority: 85,
  },
  {
    id: 'rule_battery_check',
    type: 'battery',
    title: 'Battery Health Check',
    description: 'Test battery voltage and terminals',
    conditions: [{ type: 'time', operator: 'gte', value: 365 }], // Yearly
    recurrence: 'recurring',
    priority: 50,
  },
];

class MaintenanceEngine {
  private rules: MaintenanceRule[] = DEFAULT_RULES;

  /**
   * Evaluate all rules for a bike and return maintenance due
   * @param currentOdometer Current odometer reading (km)
   * @param history Array of completed maintenance events
   * @returns Array of maintenance items due/upcoming
   */
  public evaluateRules(
    currentOdometer: number,
    history: MaintenanceEvent[]
  ): MaintenanceDue[] {
    const dueItems: MaintenanceDue[] = [];

    for (const rule of this.rules) {
      const lastEvent = this.getLastEventForRule(rule.id, history);
      const evaluation = this.evaluateRule(rule, currentOdometer, lastEvent);

      if (evaluation) {
        dueItems.push(evaluation);
      }
    }

    // Sort by priority (highest first), then by urgency
    return dueItems.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return b.priority - a.priority;
    });
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(
    rule: MaintenanceRule,
    currentOdometer: number,
    lastEvent?: MaintenanceEvent
  ): MaintenanceDue | null {
    // Base odometer/date for recurring rules
    const baseOdometer = lastEvent?.odometer || 0;
    const baseDate = lastEvent?.completedAt
      ? parseISO(lastEvent.completedAt)
      : new Date(0); // Epoch if never completed

    let isDue = false;
    let isUpcoming = false;
    let kmUntilDue: number | null = null;
    let daysUntilDue: number | null = null;

    // Evaluate each condition
    for (let i = 0; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const nextCondition = rule.conditions[i + 1];

      let conditionMet = false;

      if (condition.type === 'odometer') {
        const odometerSinceBase = currentOdometer - baseOdometer;
        const kmRemaining = condition.value - odometerSinceBase;

        conditionMet = this.compareValue(
          odometerSinceBase,
          condition.operator,
          condition.value
        );

        kmUntilDue = kmRemaining;

        // Check if upcoming (within 500 km)
        if (!conditionMet && kmRemaining <= 500) {
          isUpcoming = true;
        }
      } else if (condition.type === 'time') {
        const daysSinceBase = differenceInDays(new Date(), baseDate);
        const daysRemaining = condition.value - daysSinceBase;

        conditionMet = this.compareValue(
          daysSinceBase,
          condition.operator,
          condition.value
        );

        daysUntilDue = daysRemaining;

        // Check if upcoming (within 7 days)
        if (!conditionMet && daysRemaining <= 7) {
          isUpcoming = true;
        }
      }

      // Apply logic operator
      if (condition.logic === 'OR') {
        isDue = isDue || conditionMet;
        if (!nextCondition) break; // Last condition
      } else if (condition.logic === 'AND') {
        isDue = isDue && conditionMet;
        if (!isDue) break; // Short-circuit if AND fails
      } else {
        // No logic operator (last condition or single condition)
        isDue = conditionMet;
      }
    }

    // Determine status
    let status: 'upcoming' | 'due' | 'overdue' = 'upcoming';
    if (isDue) {
      // Check if overdue (negative days/km)
      const isOverdue =
        (kmUntilDue !== null && kmUntilDue < -500) ||
        (daysUntilDue !== null && daysUntilDue < -7);
      status = isOverdue ? 'overdue' : 'due';
    } else if (!isUpcoming) {
      return null; // Not due or upcoming
    }

    return {
      rule,
      status,
      daysUntilDue,
      kmUntilDue,
      priority: this.calculatePriority(rule, status, kmUntilDue, daysUntilDue),
      lastCompleted: lastEvent,
    };
  }

  /**
   * Compare values based on operator
   */
  private compareValue(
    actual: number,
    operator: 'gte' | 'lte' | 'eq',
    expected: number
  ): boolean {
    switch (operator) {
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'eq':
        return actual === expected;
      default:
        return false;
    }
  }

  /**
   * Calculate dynamic priority based on urgency
   */
  private calculatePriority(
    rule: MaintenanceRule,
    status: 'upcoming' | 'due' | 'overdue',
    kmUntilDue: number | null,
    daysUntilDue: number | null
  ): number {
    let priority = rule.priority;

    // Boost priority for overdue items
    if (status === 'overdue') {
      priority = Math.min(100, priority + 20);
    }

    // Boost priority for very close items
    if (kmUntilDue !== null && kmUntilDue <= 100) {
      priority = Math.min(100, priority + 10);
    }
    if (daysUntilDue !== null && daysUntilDue <= 2) {
      priority = Math.min(100, priority + 10);
    }

    return priority;
  }

  /**
   * Get last completed event for a rule
   */
  private getLastEventForRule(
    ruleId: string,
    history: MaintenanceEvent[]
  ): MaintenanceEvent | undefined {
    return history
      .filter(event => event.ruleId === ruleId)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
  }

  /**
   * Add a custom maintenance rule
   */
  public addRule(rule: MaintenanceRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a rule by ID
   */
  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  /**
   * Get all rules
   */
  public getRules(): MaintenanceRule[] {
    return [...this.rules];
  }

  /**
   * Reset rules to defaults
   */
  public resetToDefaults(): void {
    this.rules = [...DEFAULT_RULES];
  }

  /**
   * Predict next maintenance date/km (Pro feature)
   * Uses simple linear regression on trip data
   */
  public predictNextMaintenance(
    rule: MaintenanceRule,
    averageKmPerDay: number,
    currentOdometer: number,
    lastEvent?: MaintenanceEvent
  ): { predictedDate: Date; predictedOdometer: number } | null {
    const baseOdometer = lastEvent?.odometer || 0;
    const baseDate = lastEvent?.completedAt
      ? parseISO(lastEvent.completedAt)
      : new Date();

    // Find odometer condition
    const odometerCondition = rule.conditions.find(
      c => c.type === 'odometer'
    );
    if (!odometerCondition) return null;

    const kmUntilDue = odometerCondition.value - (currentOdometer - baseOdometer);
    const daysUntilDue = Math.ceil(kmUntilDue / averageKmPerDay);

    const predictedDate = new Date(baseDate);
    predictedDate.setDate(predictedDate.getDate() + daysUntilDue);

    return {
      predictedDate,
      predictedOdometer: currentOdometer + kmUntilDue,
    };
  }
}

export default new MaintenanceEngine();
