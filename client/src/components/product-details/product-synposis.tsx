interface IProductSynposisProps {
  synopsis: string | null;
}

const ProductSynopsis: React.FC<IProductSynposisProps> = ({ synopsis }) => {
  return <>{synopsis === null ? null : <p>{synopsis}</p>}</>;
};

export default ProductSynopsis;
