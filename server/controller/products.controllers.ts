import { Request, Response } from "express";
import { LocalDatabase } from "../data/database";

const db = LocalDatabase.getInstance().db;

export const get_all_products = async (req: Request, res: Response) => {
  db.all(`SELECT Name FROM Products ORDER BY ID`, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(502).json("Database error");
    } else {
      res.json(rows);
    }
  });
};

export const get_product = async (req: Request, res: Response) => {
  const { product_name } = req.params;
  db.get(
    `SELECT Name FROM PRODUCTS WHERE Name = ?`,
    product_name,
    (err, row) => {
      if (err) {
        res.status(502).json("Database error");
      } else {
        if (typeof row === "undefined") {
          res.json({});
        } else {
          res.json(row);
        }
      }
    }
  );
};
