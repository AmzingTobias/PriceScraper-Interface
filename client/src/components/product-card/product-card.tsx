import "./product-card.css";
import product_card_missing from "../../assets/product_card_missing.png";
import { redirect, useNavigate } from "react-router-dom";

export type TProductCard = {
  id: number;
  name: string;
  image_link: string;
};

interface IProductCardProps {
  product_info: TProductCard;
}

const ProductCard: React.FC<IProductCardProps> = ({ product_info }) => {
  const navigate = useNavigate();

  const goToProductPage = () => {
    navigate(`/product/${product_info.id}`, { replace: false });
  };

  if (product_info.image_link === null) {
    product_info.image_link = product_card_missing;
  }
  return (
    <div className="product-card">
      <img
        width={245}
        height={340}
        onClick={goToProductPage}
        src={product_info.image_link}
        alt={
          product_info.image_link === product_card_missing
            ? "No iamge found"
            : product_info.name + " cover art"
        }
      />
      <div className="product-name">
        <h3 onClick={goToProductPage}>{product_info.name}</h3>
      </div>
    </div>
  );
};

export default ProductCard;
