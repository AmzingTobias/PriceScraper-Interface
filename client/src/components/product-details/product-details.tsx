import { FormEvent } from "react";
import { tPriceEntry } from "../../../../server/models/price.models";
import ProductImage from "./product-image";
import ProductNotifyBtn from "./product-notify-btn";
import ProductPrice from "./product-price";
import ProductSynopsis from "./product-synposis";
import ProductTitle from "./product-title";

interface IProductDetailsProps {
  productId: number;
  name: string;
  synopsis: string | null;
  image: string;
  prices: tPriceEntry[];
  userNotifiedForProduct: boolean;
  setUserNotifiedForProduct: React.Dispatch<React.SetStateAction<boolean>>;
  authToken: string;
}

function enableNotificationsRequest(productId: number): Promise<boolean> {
  return new Promise(async (resolve, _reject) => {
    try {
      const requestBody = { ProductId: productId };
      const notificationsEnabled = await fetch("/api/notifications/link", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (notificationsEnabled.ok) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch {
      resolve(false);
    }
  });
}

function disableNotificationsRequest(productId: number): Promise<boolean> {
  return new Promise(async (resolve, _reject) => {
    try {
      const requestBody = { ProductId: productId };
      const notificationsDisabled = await fetch("/api/notifications/link", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (notificationsDisabled.ok) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch {
      resolve(false);
    }
  });
}

const ProductDetails: React.FC<IProductDetailsProps> = ({
  productId,
  name,
  synopsis,
  image,
  prices,
  userNotifiedForProduct,
  setUserNotifiedForProduct,
  authToken,
}) => {
  const goToPricePage = (event: FormEvent) => {
    event.preventDefault();
    if (prices.length > 0) {
      window.open(prices[prices.length - 1].Site_link, "_blank");
    }
  };

  const enableNotifications = (event: FormEvent) => {
    event.preventDefault();
    enableNotificationsRequest(productId).then((enabled) => {
      if (enabled) {
        setUserNotifiedForProduct(true);
      }
    });
  };

  const disableNotifications = (event: FormEvent) => {
    event.preventDefault();
    disableNotificationsRequest(productId).then((disable) => {
      if (disable) {
        setUserNotifiedForProduct(false);
      }
    });
  };

  return (
    <>
      <div className="flex justify-center flex-col lg:flex-row">
        <div className="mr-auto ml-auto">
          <ProductImage
            imageLink={image}
            width={245}
            height={340}
            alt="Product card"
          />
        </div>
        <div className="mx-2 mt-4 md:ml-4 md:mt-4 md:w-full">
          <ProductTitle productName={name} />
          <hr className="my-4 w-full" />
          <div className="flex flex-col-reverse lg:flex-row">
            <div className="w-full lg:w-3/4">
              <ProductSynopsis synopsis={synopsis} />
              <div className="md:flex md:flex-col ">
                {prices.length > 0 ? (
                  <div className="mt-4">
                    <ProductPrice
                      price={
                        prices.length > 0 ? prices[prices.length - 1].Price : 0
                      }
                      lowestPrice={
                        prices.length > 0
                          ? prices.reduce((minItem, currentItem) => {
                              if (currentItem.Price < minItem.Price) {
                                return currentItem;
                              }
                              return minItem;
                            })
                          : undefined
                      }
                    />
                  </div>
                ) : null}
                {authToken === "" ? null : userNotifiedForProduct ? (
                  <form
                    className="mt-2 mb-2 md:mt-4 lg:ml-2"
                    onSubmit={disableNotifications}
                  >
                    <ProductNotifyBtn btnText={"Stop notifications ❌"} />
                  </form>
                ) : (
                  <form
                    className="mt-2 mb-2 md:mt-4 lg:ml-2"
                    onSubmit={enableNotifications}
                  >
                    <ProductNotifyBtn btnText={"Notify Me! ✔️"} />
                  </form>
                )}
              </div>
            </div>
            <div className="mb-4 lg:mb-0 lg:ml-auto">
              {prices.length > 0 ? (
                <form onSubmit={goToPricePage} className="">
                  <ProductNotifyBtn btnText={"Go to Site!"} />
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
