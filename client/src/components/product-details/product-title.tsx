interface IProductTitleProps {
  productName: string;
}

const ProductTitle: React.FC<IProductTitleProps> = ({ productName }) => {
  return (
    <>
      <h2 className="text-4xl font-bold">{productName}</h2>
    </>
  );
};

export default ProductTitle;
