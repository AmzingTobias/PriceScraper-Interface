import React, { useEffect, useState } from "react";
import { redirect, useNavigate, useParams } from "react-router-dom";
import { tProductEntry } from "../../../../server/models/product.models";

interface IProductPageProps {
  authToken: string;
}

const getProductName = (productId: string): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const productResponse = await fetch(`/api/products/${productId}`);
      if (productResponse.ok) {
        const productJson: tProductEntry = await productResponse.json();
        resolve(productJson.Name);
      } else {
        resolve(null);
      }
    } catch {
      reject("Error");
    }
  });
};

const ProductPage: React.FC<IProductPageProps> = (props) => {
  // Show product picture
  // Show product name
  // Show product current lowest price
  // Show product hisotircal lowest price (With date)
  // Show price chart for product
  // Show notify button (if logged in)

  const navigate = useNavigate();
  const { productId } = useParams();
  const [productName, setProductName] = useState<string | null>(null);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductName = async (productId: string) => {
      try {
        const name = await getProductName(productId);
        setProductName(name);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductName(productId);
  }, [productId]);

  return (
    <>
      <h1>{productName}</h1>
    </>
  );
};

export default ProductPage;
