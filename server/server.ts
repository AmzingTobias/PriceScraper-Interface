import { configDotenv } from "dotenv";
configDotenv();
import express, { Express, Request, Response } from "express";
import { productRouter } from "./routes/product.routes";
import { priceRouter } from "./routes/price.routes";
import { siteRouter } from "./routes/site.routes";
import { notificationRouter } from "./routes/notification.routes";
import { imageRouter } from "./routes/image.routes";
import { userRouter } from "./routes/user.routes";
import { tUserAccount } from "./common/user";
import cookieParser from "cookie-parser";
import path from "path";
import { getScraperConnection } from "./common/scraper";
import { scraperRouter } from "./routes/scraper.routes";

declare global {
  namespace Express {
    interface Request {
      user?: tUserAccount;
    }
  }
}

// Will start the price scraper
getScraperConnection();

const app: Express = express();
const port: number = 5000;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const { spawn } = require("child_process");
// const pythonScraper = "../../../Python/PriceScraper/main.py";

app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productRouter);
app.use("/api/prices", priceRouter);
app.use("/api/sites", siteRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/images", imageRouter);
app.use("/api/users", userRouter);
app.use("/api/scraper", scraperRouter);

// If no router was found for the request
app.use((_req, res, _next) => {
  res.status(404).send("Page not found");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
