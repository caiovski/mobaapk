import * as SQLite from 'expo-sqlite';

function createSuccessDb() {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
  };
}

describe('SQLite Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(createSuccessDb());
  });

  it('should initialize the SQLite database with expected tables', async () => {
    const { initDB } = require('../../../data/datasources/sqlite/database');
    const db = await initDB();
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('agropet_cart.db');
    expect(db.execAsync).toHaveBeenCalled();
  });

  it('should handle database open failure and rethrow error', (done) => {
    (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValue(new Error('DB error'));
    jest.isolateModules(() => {
      const { initDB } = require('../../../data/datasources/sqlite/database');
      initDB().catch((err: Error) => {
        expect(err.message).toBe('DB error');
        done();
      });
    });
  });

  it('should handle ALTER TABLE failure gracefully', (done) => {
    const mockDb = {
      execAsync: jest.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('alter failed')),
    };
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
    jest.isolateModules(() => {
      const { initDB } = require('../../../data/datasources/sqlite/database');
      initDB().then((db: any) => {
        expect(db).toBe(mockDb);
        done();
      });
    });
  });

  it('should return cached instance on second call', async () => {
    const { initDB } = require('../../../data/datasources/sqlite/database');
    const db1 = await initDB();
    const db2 = await initDB();
    expect(db1).toBe(db2);
  });

  it('should return existing initPromise on concurrent calls', (done) => {
    let resolveOpen: any;
    (SQLite.openDatabaseAsync as jest.Mock).mockImplementation(() => new Promise((r) => { resolveOpen = r; }));
    jest.isolateModules(() => {
      const { initDB } = require('../../../data/datasources/sqlite/database');
      const promise1 = initDB();
      const promise2 = initDB();
      expect(promise1).toBe(promise2);
      resolveOpen(createSuccessDb());
      promise1.then(() => done());
    });
  });
});