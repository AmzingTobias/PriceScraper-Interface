import { FormEvent } from "react";
import { tPriceEntry } from "../../../../server/models/price.models";
import ProductImage from "./product-image";
import ProductNotifyBtn from "./product-notify-btn";
import ProductPrice from "./product-price";
import ProductSynopsis from "./product-synposis";
import ProductTitle from "./product-title";

interface IProductDetailsProps {
  name: string;
  synopsis: string;
  image: string;
  prices: tPriceEntry[];
}

const ProductDetails: React.FC<IProductDetailsProps> = ({
  name,
  synopsis,
  image,
  prices,
}) => {
  const goToPricePage = (event: FormEvent) => {
    event.preventDefault();
    if (prices.length > 0) {
      window.open(prices[prices.length - 1].Site_link, "_blank");
    }
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
            <div className="mt-4">
              <ProductPrice
                price={prices.length > 0 ? prices[prices.length - 1].Price : 0}
              />
            </div>
            <form className="mt-2">
              <ProductNotifyBtn btnText={"Notify Me! ✔️"} />
            </form>
          </div>
          <div className="ml-auto">
            <form onSubmit={goToPricePage} className="">
              <ProductNotifyBtn btnText={"Go to Site!"} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
