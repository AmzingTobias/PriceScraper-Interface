import React from "react";
import { useParams } from "react-router-dom";

interface IProductPageProps {
  authToken: string;
}

const ProductPage: React.FC<IProductPageProps> = (props) => {
  const { productId } = useParams();
  return <>{productId}</>;
};

export default ProductPage;
