import { useEffect, useState } from "react";
import ProductGrid from "../../components/product-grid/product-grid";
import { TProductCard } from "../../components/product-card/product-card";
import { tProductEntry } from "../../../../server/models/product.models";
import { TProductList } from "../../../../server/models/notification.models";
import OnlyShowNotifiedProductsBtn, {
  ENotifiedProductsBtnStatus,
} from "../../components/product/only-show-notified-products";

interface IHomePageProps {
  authToken: string;
}

const HomePage: React.FC<IHomePageProps> = ({ authToken }) => {
  const [productData, setProductData] = useState<TProductCard[]>([]);
  const [notifiedProductIds, setNotifiedProductIds] = useState<TProductList>();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: tProductEntry[] = await response.json();
        const productDataPromises = data.map(async (product) => {
          const imageResponse = await fetch(
            `/api/images/product/${product.Id}`
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

    const fetchNotifiedData = async () => {
      try {
        const response = await fetch("/api/notifications/user/product");
        if (response.ok) {
          const responseJson: TProductList = await response.json();
          setNotifiedProductIds(responseJson);
        } else {
          setNotifiedProductIds(undefined);
        }
      } catch {
        setNotifiedProductIds(undefined);
      }
    };

    fetchProductData();
    fetchNotifiedData();
  }, []);

  const [showNotifiedProductsState, setShowNotifiedProductsState] =
    useState<ENotifiedProductsBtnStatus>(
      ENotifiedProductsBtnStatus.OnlyNotified
    );

  return (
    <>
      {notifiedProductIds === undefined ||
      showNotifiedProductsState === ENotifiedProductsBtnStatus.AllProducts ? (
        <ProductGrid product_info_list={productData} />
      ) : (
        <ProductGrid
          product_info_list={productData.filter((value) =>
            notifiedProductIds.some(
              (notifiedProduct) => notifiedProduct.ProductId === value.id
            )
          )}
        />
      )}
      {authToken === "" ? null : (
        <OnlyShowNotifiedProductsBtn
          state={showNotifiedProductsState}
          setState={setShowNotifiedProductsState}
        />
      )}
    </>
  );
};

export default HomePage;
