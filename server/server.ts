import { configDotenv } from "dotenv";
configDotenv();
import express, { Express, Request, Response } from "express";
import { productRouter } from "./routes/product.routes";
import { priceRouter } from "./routes/price.routes";
import { siteRouter } from "./routes/site.routes";
import { notificationRouter } from "./routes/notificant.routes";
import { imageRouter } from "./routes/image.routes";
import { userRouter } from "./routes/user.routes";
import { tUserAccount } from "./common/user";

declare global {
  namespace Express {
    interface Request {
      user?: tUserAccount;
    }
  }
}

const app: Express = express();
const port: number = 5000;

// const { spawn } = require("child_process");
// const pythonScraper = "../../../Python/PriceScraper/main.py";

app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/prices", priceRouter);
app.use("/api/sites", siteRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/images", imageRouter);
app.use("/api/users", userRouter);

// const pythonProcess = spawn(
//   "C:/Users/Tobias/Documents/Coding/Python/PriceScraper/env/Scripts/python",
//   [pythonScraper]
// );

// pythonProcess.stdout.on("data", (data) => {
//   console.log(`Python script output: ${data}`);
// });

// pythonProcess.stderr.on("data", (data) => {
//   console.error(`Python script error: ${data}`);
// });

// pythonProcess.on("close", (code) => {
//   console.log(`Python script exited with code ${code}`);
// });

// If no router was found for the request
app.use((_req, res, _next) => {
  res.status(404).send("Page not found");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
