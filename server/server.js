const express = require("express");
const app = express();
const port = 5000;
const sqlite3 = require("sqlite3");

app.get("/api", (req, res) => {
  res.json({ users: ["UserOne", "UserTwo", "UserThree"] });
});
let productRouter = require("./routes/product.routes");

app.use("/api/products", productRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
