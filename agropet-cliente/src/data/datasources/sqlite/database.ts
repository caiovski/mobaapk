import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let db: SQLite.SQLiteDatabase;
    try {
      db = await SQLite.openDatabaseAsync('agropet_cart.db');
      await db.execAsync('CREATE TABLE IF NOT EXISTS cart ( id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL, image_url TEXT )');
      await db.execAsync('CREATE TABLE IF NOT EXISTS products_cache ( id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, price REAL NOT NULL, description TEXT, image_url TEXT, stock INTEGER, active INTEGER DEFAULT 1, cached_at INTEGER NOT NULL )');
      await db.execAsync('CREATE TABLE IF NOT EXISTS orders_cache ( id TEXT PRIMARY KEY NOT NULL, status TEXT NOT NULL, total REAL NOT NULL, payment_method TEXT NOT NULL, delivery_type TEXT NOT NULL, created_at TEXT NOT NULL, data_json TEXT, cached_at INTEGER NOT NULL )');
      await db.execAsync('CREATE TABLE IF NOT EXISTS sync_queue ( id INTEGER PRIMARY KEY AUTOINCREMENT, operation TEXT NOT NULL, table_name TEXT NOT NULL, data_json TEXT NOT NULL, created_at INTEGER NOT NULL, synced INTEGER DEFAULT 0 )');

      try {
        await db.execAsync('ALTER TABLE orders_cache ADD COLUMN data_json TEXT');
      } catch {
        // Coluna já existe — ignorar
      }
      try {
        await db.execAsync('ALTER TABLE cart ADD COLUMN is_bulk INTEGER DEFAULT 0');
      } catch {
        // Coluna já existe — ignorar
      }
      try {
        await db.execAsync('ALTER TABLE cart ADD COLUMN is_per_meter INTEGER DEFAULT 0');
      } catch {
        // Coluna já existe — ignorar
      }
    } catch (e) {
      initPromise = null;
      throw e;
    }

    dbInstance = db!;
    return db!;
  })();

  return initPromise;
}

