import ProductCard, { TProductCard } from "../product-card/product-card";
import "./product-grid.css";

interface IProductGridProps {
  product_info_list: TProductCard[];
}

const ProductGrid: React.FC<IProductGridProps> = ({ product_info_list }) => {
  return (
    <div className="product-grid">
      {product_info_list.map((item, index) => (
        <ProductCard key={index} product_info={item} />
      ))}
    </div>
  );
};

export default ProductGrid;
