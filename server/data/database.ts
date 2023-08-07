import sqlite3, { Database } from "sqlite3";

let instance: LocalDatabase | undefined = undefined;

class LocalDatabase {
  db: Database;

  constructor() {
    this.db = new sqlite3.Database(process.env.DATABASE_PATH as string);
    this.db.serialize(() => {
      this.db.run("PRAGMA foreign_keys = ON;", (err) => {
        if (err) {
          console.error("Error enabling foreign key support:", err);
        } else {
          console.log("Foreign key support is enabled.");
        }
      });
    });
  }

  static getInstance() {
    if (!instance) {
      instance = new LocalDatabase();
    }
    return instance;
  }
}

export function getDatabase(): Database {
  return LocalDatabase.getInstance().db;
}
