import product_card_missing from "../../assets/product_card_missing.png";
import { useNavigate } from "react-router-dom";

export type TProductCard = {
  id: number;
  name: string;
  image_link: string | null;
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
    <div className="w-60 block">
      <img
        className="cursor-pointer
      hover:scale-105 duration-200 transition
      shadow-xl
      shadow-gray-800"
        width={320}
        height={480}
        style={{ width: 245, height: 340 }}
        onClick={goToProductPage}
        src={product_info.image_link}
        alt={
          product_info.image_link === product_card_missing
            ? "No iamge found"
            : product_info.name + " cover art"
        }
      />
      <div className="py-1 my-3 flex items-center bg-neutral-800 bg-opacity-70">
        <h3
          className="m-3 text-neutral-200 cursor-pointer text-lg
          hover:underline hover:decoration-2"
          onClick={goToProductPage}
        >
          {product_info.name}
        </h3>
      </div>
    </div>
  );
};

export default ProductCard;
