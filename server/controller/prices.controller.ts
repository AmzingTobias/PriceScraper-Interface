import { Request, Response } from "express";
import { LocalDatabase } from "../data/database";
import { date_string_to_date } from "../common/date";

const db = LocalDatabase.getInstance().db;

interface IProductPrice {
  Price: number;
  Date: string | Date;
  Site_link: string;
}

export const get_product_price = async (req: Request, res: Response) => {
  const { product_name } = req.params;
  db.all(
    `SELECT Prices.Price, Prices.Date, Sources.Site_link
    FROM Prices
    JOIN Products ON Prices.Product_Id = Products.Id
    JOIN Sources ON Prices.Site_Id = Sources.Id
    WHERE Products.Name = ?;
  `,
    product_name,
    (err, row: any[]) => {
      if (err) {
        res.status(502).json("Database error");
      } else {
        if (typeof row === "undefined") {
          res.json({});
        } else {
          // Map the data received to then return as json
          const dataReceived: IProductPrice[] = row.map((element) => ({
            Price: element.Price,
            Date: date_string_to_date(element.Date),
            Site_link: element.Site_link,
          }));
          res.json(dataReceived);
        }
      }
    }
  );
};
