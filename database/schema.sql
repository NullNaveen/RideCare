-- RideCare Database Schema (SQLite)
-- Version: 1.0.0
-- For local storage (offline-first)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  name TEXT,
  created_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0 CHECK(synced IN (0,1))
);

-- Bikes table
CREATE TABLE IF NOT EXISTS bikes (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK(year >= 2000 AND year <= 2030),
  vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('Motorcycle', 'Scooter', 'Moped')),
  variant TEXT,
  odometer_km REAL DEFAULT 0 CHECK(odometer_km >= 0),
  bluetooth_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0 CHECK(synced IN (0,1)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bikes_user_id ON bikes(user_id);
CREATE INDEX IF NOT EXISTS idx_bikes_synced ON bikes(synced);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY NOT NULL,
  bike_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  start_lat REAL,
  start_lng REAL,
  end_lat REAL,
  end_lng REAL,
  distance_km REAL NOT NULL CHECK(distance_km >= 0),
  avg_speed_kmh REAL CHECK(avg_speed_kmh >= 0),
  max_speed_kmh REAL CHECK(max_speed_kmh >= 0),
  path TEXT, -- Encoded polyline or compressed GeoJSON
  notes TEXT,
  fuel_consumed_est REAL,
  synced INTEGER DEFAULT 0 CHECK(synced IN (0,1)),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trips_bike_id ON trips(bike_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_trips_synced ON trips(synced);

-- Maintenance events table
CREATE TABLE IF NOT EXISTS maintenance_events (
  id TEXT PRIMARY KEY NOT NULL,
  bike_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('service', 'oil_change', 'chain_lube', 'brake_check', 'tyre_inspection', 'battery')),
  km_due_at REAL,
  date_due INTEGER, -- Unix timestamp
  notified INTEGER DEFAULT 0 CHECK(notified IN (0,1)),
  completed INTEGER DEFAULT 0 CHECK(completed IN (0,1)),
  completed_at INTEGER,
  completed_km REAL,
  cost REAL CHECK(cost >= 0),
  notes TEXT,
  receipt_urls TEXT, -- JSON array of URLs
  created_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0 CHECK(synced IN (0,1)),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_bike_id ON maintenance_events(bike_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completed ON maintenance_events(completed);
CREATE INDEX IF NOT EXISTS idx_maintenance_km_due ON maintenance_events(km_due_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_synced ON maintenance_events(synced);

-- Maintenance rules table
CREATE TABLE IF NOT EXISTS maintenance_rules (
  id TEXT PRIMARY KEY NOT NULL,
  bike_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('service', 'oil_change', 'chain_lube', 'brake_check', 'tyre_inspection', 'battery')),
  interval_km REAL CHECK(interval_km > 0),
  interval_days INTEGER CHECK(interval_days > 0),
  logic TEXT DEFAULT 'OR' CHECK(logic IN ('OR', 'AND')),
  recurring INTEGER DEFAULT 1 CHECK(recurring IN (0,1)),
  enabled INTEGER DEFAULT 1 CHECK(enabled IN (0,1)),
  synced INTEGER DEFAULT 0 CHECK(synced IN (0,1)),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rules_bike_id ON maintenance_rules(bike_id);
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON maintenance_rules(enabled);

-- Settings table (user preferences)
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY NOT NULL,
  notifications_push INTEGER DEFAULT 1,
  notifications_email INTEGER DEFAULT 0,
  notifications_calendar INTEGER DEFAULT 0,
  theme TEXT DEFAULT 'system' CHECK(theme IN ('light', 'dark', 'system')),
  telemetry_enabled INTEGER DEFAULT 0,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data for testing

-- Insert test user
INSERT OR IGNORE INTO users (id, email, name, created_at, synced)
VALUES ('test-user-1', 'test@ridecare.app', 'Test User', strftime('%s', 'now') * 1000, 1);

-- Insert test bike
INSERT OR IGNORE INTO bikes (id, user_id, nickname, make, model, year, vehicle_type, variant, odometer_km, created_at, updated_at, synced)
VALUES (
  'test-bike-1',
  'test-user-1',
  'My Splendor',
  'Hero',
  'Splendor Plus BS6',
  2023,
  'Motorcycle',
  'BS6 FI',
  12000.0,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000,
  1
);

-- Insert maintenance rules for Hero Splendor
INSERT OR IGNORE INTO maintenance_rules (id, bike_id, type, interval_km, interval_days, logic, recurring, enabled)
VALUES
  ('rule-1', 'test-bike-1', 'service', 6000, 180, 'OR', 1, 1),
  ('rule-2', 'test-bike-1', 'oil_change', 3000, 90, 'OR', 1, 1),
  ('rule-3', 'test-bike-1', 'chain_lube', 500, 15, 'OR', 1, 1),
  ('rule-4', 'test-bike-1', 'brake_check', 12000, 365, 'OR', 1, 1),
  ('rule-5', 'test-bike-1', 'tyre_inspection', 18000, 540, 'OR', 1, 1),
  ('rule-6', 'test-bike-1', 'battery', NULL, 730, 'OR', 1, 1);

-- Insert sample maintenance event (oil change due)
INSERT OR IGNORE INTO maintenance_events (id, bike_id, type, km_due_at, notified, completed, created_at)
VALUES (
  'maintenance-1',
  'test-bike-1',
  'oil_change',
  15000.0,
  0,
  0,
  strftime('%s', 'now') * 1000
);

-- Insert sample trip
INSERT OR IGNORE INTO trips (id, bike_id, start_time, end_time, start_lat, start_lng, end_lat, end_lng, distance_km, avg_speed_kmh, max_speed_kmh, notes, synced)
VALUES (
  'trip-1',
  'test-bike-1',
  strftime('%s', 'now', '-1 hour') * 1000,
  strftime('%s', 'now') * 1000,
  12.9716,
  77.5946,
  12.9352,
  77.6245,
  15.3,
  32.5,
  58.0,
  'Morning commute',
  0
);

-- Insert user settings
INSERT OR IGNORE INTO settings (user_id, notifications_push, theme, telemetry_enabled)
VALUES ('test-user-1', 1, 'dark', 0);
