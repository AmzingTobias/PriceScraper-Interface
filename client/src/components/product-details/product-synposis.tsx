interface IProductSynposisProps {
  synopsis: string;
}

const ProductSynopsis: React.FC<IProductSynposisProps> = ({ synopsis }) => {
  return (
    <>
      <p>{synopsis}</p>
    </>
  );
};

export default ProductSynopsis;
