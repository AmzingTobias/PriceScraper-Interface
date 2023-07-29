const Database = require("../data/database");

const db = Database.db;

const get_all_products = async (req, res) => {
  if (typeof db !== "undefined") {
    db.all(`SELECT Name FROM Products ORDER BY ID`, (err, rows) => {
      if (err) {
        console.error(err);
        res.status(502).json("Database error");
      } else {
        res.json(rows);
      }
    });
  } else {
    console.error("Database not connected");
    res.status(500).json();
  }
};

const get_product = async (req, res) => {
  const product_name = req.params.name;
  db.get(
    `SELECT Name FROM PRODUCTS WHERE Name = ?`,
    product_name,
    (err, row) => {
      if (err) {
        res.status(502).json("Database error");
      } else {
        if (typeof row === "undefined") {
          console.log("Test");
          res.json({});
        } else {
          res.json(row);
        }
      }
    }
  );
};

module.exports = {
  get_all_products,
  get_product,
};
