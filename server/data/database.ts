import sqlite3, { Database } from "sqlite3";

let instance: LocalDatabase | undefined = undefined;

export class LocalDatabase {
  db: Database;

  constructor() {
    this.db = new sqlite3.Database(
      "../../../Python/PriceScraper/database/data.db"
    );
  }

  static getInstance() {
    if (!instance) {
      instance = new LocalDatabase();
    }
    return instance;
  }
}

export default {
  LocalDatabase,
};
