import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sales_app.db');

export const initDatabase = () => {
  db.transaction(tx => {
    // Contacts table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        stage TEXT,
        registration_latitude REAL,
        registration_longitude REAL,
        registration_timestamp TEXT,
        last_visit_latitude REAL,
        last_visit_longitude REAL,
        last_visit_timestamp TEXT,
        created_at TEXT,
        updated_at TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0
      );`
    );
    
    // Orders table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_id TEXT UNIQUE NOT NULL,
        order_number TEXT,
        contact_sync_id TEXT,
        amount REAL,
        status TEXT,
        source TEXT,
        order_latitude REAL,
        order_longitude REAL,
        order_timestamp TEXT,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (contact_sync_id) REFERENCES contacts(sync_id)
      );`
    );
    
    // Activities table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_id TEXT UNIQUE NOT NULL,
        type TEXT,
        contact_sync_id TEXT,
        activity_latitude REAL,
        activity_longitude REAL,
        activity_timestamp TEXT,
        activity_date TEXT,
        duration_minutes INTEGER,
        outcome TEXT,
        notes TEXT,
        created_at TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (contact_sync_id) REFERENCES contacts(sync_id)
      );`
    );
    
    // Sync queue table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT,
        entity_sync_id TEXT,
        operation TEXT,
        json_data TEXT,
        created_at TEXT,
        retry_count INTEGER DEFAULT 0
      );`
    );
  });
};

export const insertContact = (contact) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO contacts (sync_id, name, phone, email, stage, registration_latitude, registration_longitude, registration_timestamp, created_at, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          contact.syncId,
          contact.name,
          contact.phone,
          contact.email,
          contact.stage,
          contact.location?.latitude,
          contact.location?.longitude,
          contact.location?.timestamp,
          contact.createdAt,
          contact.updatedAt,
          0
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnsyncedRecords = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const results = {};
      
      tx.executeSql(
        'SELECT * FROM contacts WHERE synced = 0',
        [],
        (_, { rows: { _array } }) => {
          results.contacts = _array;
        }
      );
      
      tx.executeSql(
        'SELECT * FROM orders WHERE synced = 0',
        [],
        (_, { rows: { _array } }) => {
          results.orders = _array;
        }
      );
      
      tx.executeSql(
        'SELECT * FROM activities WHERE synced = 0',
        [],
        (_, { rows: { _array } }) => {
          results.activities = _array;
          resolve(results);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const markAsSynced = (entityType, syncId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE ${entityType} SET synced = 1 WHERE sync_id = ?`,
        [syncId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};