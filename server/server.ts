import express, { Express, Request, Response } from "express";
import { productRouter } from "./routes/product.routes";
import { priceRouter } from "./routes/prices.routes";
const app: Express = express();
const port: number = 5000;

// const { spawn } = require("child_process");
// const pythonScraper = "../../../Python/PriceScraper/main.py";

app.use("/api/products", productRouter);
app.use("/api/prices", priceRouter);

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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
