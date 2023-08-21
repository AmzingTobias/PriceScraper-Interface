import { spawn, ChildProcess } from "child_process";

const PROGRAM_LOGS_MAX_SIZE = 100;

let instance: PriceScraperConnection | undefined = undefined;

/**
 * Price scraper connection. Will run the price scraper python file
 */
class PriceScraperConnection {
  private static instance: PriceScraperConnection;
  private scraperProcess: ChildProcess | undefined;
  programLogs: string[] = [];
  constructor() {
    if (PriceScraperConnection.instance) {
      console.log("Instance already exists");
      return PriceScraperConnection.instance;
    }
    if (
      process.env.PYTHON_ENV_PATH !== undefined &&
      process.env.SCRAPER_PATH !== undefined &&
      process.env.SCRAPER_CONFIG_PATH !== undefined
    ) {
      console.log("Spawning task");
      // Create the price scraper process
      this.scraperProcess = spawn(process.env.PYTHON_ENV_PATH, [
        process.env.SCRAPER_PATH,
        process.env.SCRAPER_CONFIG_PATH,
      ]);

      // Add output from price scraper to the logs
      if (this.scraperProcess.stdout !== null) {
        this.scraperProcess.stdout.on("data", (data: Buffer) => {
          this.addToLogs(data.toString());
        });
      }
      if (this.scraperProcess.stderr !== null) {
        this.scraperProcess.stderr.on("data", (data) => {
          this.addToLogs(data);
        });
      }
      this.scraperProcess.on("close", (code) => {
        this.addToLogs(`Exited with code: ${code}`);
      });
    } else {
      console.error("Missing environment variables");
    }
  }

  addToLogs(data: any) {
    // Log is treated as a queue, to ensure a maximum size
    if (this.programLogs.length == PROGRAM_LOGS_MAX_SIZE) {
      this.programLogs.shift();
    }
    try {
      this.programLogs.push(`${data.toString().trim()}`);
    } catch {}
  }

  // Singleton instance of the price scraper
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
