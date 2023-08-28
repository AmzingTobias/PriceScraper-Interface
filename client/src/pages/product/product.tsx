import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tPriceEntry } from "../../../../server/models/price.models";
import product_card_missing from "../../assets/product_card_missing.png";
import ProductDetails from "../../components/product-details/product-details";
import ProductPriceHistory from "../../components/product-details/product-price-history";
import {
  fetchProductDetails,
  fetchProductImageDetailsWithProductId,
} from "../../common/products";

interface IProductPageProps {
  authToken: string;
  isUserAdmin: boolean;
}

const getAllPricesForProduct = (productId: string): Promise<tPriceEntry[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const priceResponse = await fetch(`/api/prices/${productId}`);
      if (priceResponse.ok) {
        const priceJsonResponse: tPriceEntry[] = await priceResponse.json();
        resolve(priceJsonResponse);
      } else {
        reject("Error with price request, product doesn't exist");
      }
    } catch {
      reject("Error with price request");
    }
  });
};

const isUserNotifiedForProduct = (productId: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const notifiedResponse = await fetch(
        `/api/notifications/product/${productId}`
      );
      if (notifiedResponse.ok) {
        const notificationJson = await notifiedResponse.json();
        resolve(notificationJson);
      } else {
        reject("Error with request, probably not logged in");
      }
    } catch {
      reject("Error with notification request");
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
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string | null>(
    null
  );
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const getProductDetails = async (productId: string) => {
      try {
        const details = await fetchProductDetails(productId);
        setProductName(details.Name);
        setProductDescription(details.Description);
      } catch {
        navigate("/", { replace: false });
      }
    };
    getProductDetails(productId);
  }, [navigate, productId]);

  const [productImage, setProductImage] =
    useState<string>(product_card_missing);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const getProductImage = async (productId: string) => {
      try {
        const image = await fetchProductImageDetailsWithProductId(productId);
        if (image === undefined) {
          setProductImage(product_card_missing);
        } else {
          setProductImage(image.Link);
        }
      } catch {
        navigate("/", { replace: false });
      }
    };
    getProductImage(productId);
  }, [navigate, productId]);

  const [productPrices, setProductPrices] = useState<tPriceEntry[]>([]);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductPrices = async (productId: string) => {
      try {
        const prices = await getAllPricesForProduct(productId);
        setProductPrices(prices);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductPrices(productId);
  }, [navigate, productId]);

  const [userNotifiedForProduct, setUserNotifiedForProduct] = useState(false);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchNotifiedForProduct = async (productId: string) => {
      try {
        const notifiedForProduct = await isUserNotifiedForProduct(productId);
        setUserNotifiedForProduct(notifiedForProduct);
      } catch {
        setUserNotifiedForProduct(false);
      }
    };
    fetchNotifiedForProduct(productId);
  }, [navigate, productId, props.authToken]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className="
              w-11/12
              xl:w-4/5
              2xl:w-3/5
              mt-8"
        >
          <div
            className="text-neutral-200 bg-gray-800 
      flex flex-col rounded-2xl px-2 py-4 lg:p-4"
          >
            <ProductDetails
              productId={Number(productId)}
              name={productName}
              synopsis={productDescription}
              image={productImage}
              prices={productPrices}
              userNotifiedForProduct={userNotifiedForProduct}
              setUserNotifiedForProduct={setUserNotifiedForProduct}
              authToken={props.authToken}
              isUserAdmin={props.isUserAdmin}
            />
          </div>
          {productPrices.length > 1 ? (
            <div className="bg-gray-800 rounded-2xl p-2 lg:p-4 my-8">
              <h1 className="text-3xl font-bold text-neutral-200">
                Price History
              </h1>
              <div className="w-full mt-4 h-56 sm:h-72 lg:h-96">
                <ProductPriceHistory prices={productPrices} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ProductPage;
