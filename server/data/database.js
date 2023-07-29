const sqlite3 = require("sqlite3");

let instance = undefined;

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      "../../../Python/PriceScraper/database/data.db"
    );
  }

  static getInstance() {
    if (!instance) {
      instance = new Database();
    }
    return instance;
  }
}

module.exports = Database.getInstance();
