import { useEffect, useState } from "react";
import ProductGrid from "../components/product-grid/product-grid";
import "./home.css";
import { TProductCard } from "../components/product-card/product-card";
import { tProductEntry } from "../../../server/models/product.models";

const HomePage = () => {
  const [productData, setProductData] = useState<TProductCard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: tProductEntry[] = await response.json();
        const productDataPromises = data.map(async (product) => {
          const imageResponse = await fetch(
            `/api/images/product?ProductId=${product.Id}`
          );
          const imageData = await imageResponse.json();
          return {
            id: product.Id,
            name: product.Name,
            image_link: imageData === null ? null : imageData.Link,
          };
        });

        const productDataScraped = await Promise.all(productDataPromises);
        setProductData(productDataScraped);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <ProductGrid product_info_list={productData} />;
};

export default HomePage;
