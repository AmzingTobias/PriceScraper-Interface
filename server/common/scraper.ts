import { spawn, ChildProcess } from 'child_process';
import { get_today_date_as_string_with_time } from './date';

let instance: PriceScraperConnection | undefined = undefined;
const PROGRAM_LOGS_MAX_SIZE = 1000;

class PriceScraperConnection {
  private static instance: PriceScraperConnection;
  private scraperProcess: ChildProcess | undefined;
  programLogs: string[] = [];

  private constructor() {
    if (PriceScraperConnection.instance) {
      console.log("Instance already exists");
      return PriceScraperConnection.instance;
    }

    this.startScraperProcess(); // Kick off the initial run
  }

  importSiteToScraper(import_link: string) {
    if (
      process.env.SCRAPER_PATH &&
      process.env.SCRAPER_CONFIG_PATH
    ) {
      console.log("Starting scraper in import mode");

      const import_process = spawn(process.env.SCRAPER_PATH, [
        "import",
        import_link
      ], { env: { PRICESCRAPER_CONFIG_PATH: process.env.SCRAPER_CONFIG_PATH } });

      import_process.stdout?.on("data", (data: Buffer) => {
        this.addToLogs(data.toString());
      });

      import_process.stderr?.on("data", (data: Buffer) => {
        this.addToLogs(data.toString());
      });

      // Handle close event
      import_process.on("close", (code) => {
        this.addToLogs(`Scraper import exited with code ${code}`);
      });
    }
    else {
      console.error("Missing required environment variables.");
      this.addToLogs("Scraper import could not start: missing env vars.");
    }
  }

  private startScraperProcess() {
    if (
      process.env.SCRAPER_PATH &&
      process.env.SCRAPER_CONFIG_PATH
    ) {
      console.log("Spawning scraper task...");

      this.scraperProcess = spawn(process.env.SCRAPER_PATH, [
        "scrape",
      ], { env: { PRICESCRAPER_CONFIG_PATH: process.env.SCRAPER_CONFIG_PATH } });

      // Listen for stdout and stderr
      this.scraperProcess.stdout?.on("data", (data: Buffer) => {
        this.addToLogs(data.toString());
      });

      this.scraperProcess.stderr?.on("data", (data: Buffer) => {
        this.addToLogs(data.toString());
      });

      // Handle close event
      this.scraperProcess.on("close", (code) => {
        this.addToLogs(`Scraper exited with code ${code}`);
        this.scraperProcess = undefined;

        this.addToLogs("Restarting scraper after 30-minute delay...");
        // Wait 30 minutes before restarting
        setTimeout(() => {
          this.startScraperProcess();
        }, 30 * 60 * 1000);
      });

      // Handle errors
      this.scraperProcess.on("error", (err) => {
        this.addToLogs(`Scraper process error: ${err}`);
      });
    } else {
      console.error("Missing required environment variables.");
      this.addToLogs("Scraper could not start: missing env vars.");
    }
  }

  private addToLogs(data: string) {
    if (this.programLogs.length >= PROGRAM_LOGS_MAX_SIZE) {
      this.programLogs.shift(); // Maintain log size
    }
    try {
      this.programLogs.push(
        `${get_today_date_as_string_with_time()} ${data.trim()}`
      );
    } catch {
      // Optional: handle bad data
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new PriceScraperConnection();
    }
    return instance;
  }
}

export function getScraperConnection() {
  return PriceScraperConnection.getInstance();
}
