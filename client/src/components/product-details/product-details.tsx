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
  synopsis: string;
  image: string;
  prices: tPriceEntry[];
  userNotifiedForProduct: boolean;
  setUserNotifiedForProduct: React.Dispatch<React.SetStateAction<boolean>>;
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
      <div className="">
        <ProductImage
          imageLink={image}
          width={245}
          height={340}
          alt="Product card"
        />
      </div>
      <div className="ml-4 mt-4 w-full">
        <ProductTitle productName={name} />
        <hr className="my-4 w-full" />
        <div className="flex flex-row">
          <div className="w-3/4">
            <ProductSynopsis synopsis={synopsis} />
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
            {userNotifiedForProduct ? (
              <form className="mt-2" onSubmit={disableNotifications}>
                <ProductNotifyBtn btnText={"Stop notifications ❌"} />
              </form>
            ) : (
              <form className="mt-2" onSubmit={enableNotifications}>
                <ProductNotifyBtn btnText={"Notify Me! ✔️"} />
              </form>
            )}
          </div>
          <div className="ml-auto">
            {prices.length > 0 ? (
              <form onSubmit={goToPricePage} className="">
                <ProductNotifyBtn btnText={"Go to Site!"} />
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
