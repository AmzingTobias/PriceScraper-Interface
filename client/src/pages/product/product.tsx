import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tProductEntry } from "../../../../server/models/product.models";
import { tImageEntry } from "../../../../server/models/image.models";
import { tPriceEntry } from "../../../../server/models/price.models";
import product_card_missing from "../../assets/product_card_missing.png";
import ProductDetails from "../../components/product-details/product-details";
import ProductPriceHistory from "../../components/product-details/product-price-history";

interface IProductPageProps {
  authToken: string;
}

const getProductName = (productId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const productResponse = await fetch(`/api/products/${productId}`);
      if (productResponse.ok) {
        const productJson: tProductEntry = await productResponse.json();
        resolve(productJson.Name);
      } else {
        resolve("");
      }
    } catch {
      reject("Error");
    }
  });
};

const getProductImageLink = (productId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageResponse = await fetch(`/api/images/product/${productId}`);
      if (imageResponse.ok) {
        const imageJson: tImageEntry = await imageResponse.json();
        if (imageJson === null) {
          resolve(product_card_missing);
        } else {
          resolve(imageJson.Link);
        }
      } else {
        reject("Error with image request");
      }
    } catch {
      reject("Error with image request");
    }
  });
};

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
  }, [navigate, productId]);

  const [productImage, setProductImage] =
    useState<string>(product_card_missing);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductImage = async (productId: string) => {
      try {
        const image = await getProductImageLink(productId);
        setProductImage(image);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductImage(productId);
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

  const synopsis =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
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
              synopsis={synopsis}
              image={productImage}
              prices={productPrices}
              userNotifiedForProduct={userNotifiedForProduct}
              setUserNotifiedForProduct={setUserNotifiedForProduct}
              authToken={props.authToken}
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
