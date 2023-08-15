interface IProductPriceProps {
  price: number;
}

const ProductPrice: React.FC<IProductPriceProps> = ({ price }) => {
  const PRICE_DECIMAL_DIGITS = 2;
  return (
    <>
      <p className="text-2xl">
        Price:{" "}
        <span className="font-semibold">
          £{price.toFixed(PRICE_DECIMAL_DIGITS)}
        </span>
      </p>
    </>
  );
};

export default ProductPrice;
