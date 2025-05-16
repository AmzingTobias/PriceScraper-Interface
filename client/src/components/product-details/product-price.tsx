import { tPriceEntry } from "../../../../server/models/price.models";
import { formatDateFromEpoch } from "../../common/date-format";

interface IProductPriceProps {
  price: number;
  lowestPrice?: tPriceEntry;
}

const ProductPrice: React.FC<IProductPriceProps> = ({ price, lowestPrice }) => {
  const PRICE_DECIMAL_DIGITS = 2;
  return (
    <>
      <p className="text-2xl">
        Price:{" "}
        <span className="font-semibold">
          £{price.toFixed(PRICE_DECIMAL_DIGITS)}
        </span>
        {lowestPrice !== undefined ? <>{"    "}</> : null}
      </p>
      {lowestPrice !== undefined ? (
        <p className="font-semibold">
          {" "}
          Lowest Price:{" "}
          <span className="font-semibold">
            £{lowestPrice?.Price.toFixed(PRICE_DECIMAL_DIGITS)}
          </span>
          {" on "}
          <span className="italic text-sm">{formatDateFromEpoch(lowestPrice?.Date)}</span>
        </p>
      ) : null}
    </>
  );
};

export default ProductPrice;
