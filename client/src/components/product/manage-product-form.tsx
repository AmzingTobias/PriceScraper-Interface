import { IoTrashOutline } from "react-icons/io5";
import { tSiteEntry } from "../../../../server/models/site.models";
import { FormEvent, useEffect, useState } from "react";
import product_card_missing from "../../assets/product_card_missing.png";
import { tImageEntry } from "../../../../server/models/image.models";
import {
  fetchProductImageDetailsWithId,
  fetchProductImageDetailsWithProductId,
} from "../../common/products";

interface IManageProductFormProps {
  productId: string | number;
  productName: string | undefined;
  setProductName: React.Dispatch<React.SetStateAction<string | undefined>>;
  productDescription: string | undefined;
  setProductDescription: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  productImage: tImageEntry | undefined;
  setProductImage: React.Dispatch<
    React.SetStateAction<tImageEntry | undefined>
  >;
  productSites: tSiteEntry[];
  setProductSites: React.Dispatch<React.SetStateAction<tSiteEntry[]>>;
  handleFormSubmit: (event: FormEvent) => void;
}

const ManageProductForm: React.FC<IManageProductFormProps> = ({
  productId,
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  productImage,
  setProductImage,
  productSites,
  setProductSites,
  handleFormSubmit,
}) => {
  const [newSite, setNewSite] = useState<string>("");

  const handleDeleteSite = (indexToDelete: number) => {
    setProductSites((previous) =>
      previous.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleAddSite = () => {
    if (!isNaN(Number(productId))) {
      setProductSites((previous) => [
        ...previous,
        { Id: NaN, Link: newSite, ProductId: Number(productId) },
      ]);
      setNewSite("");
    }
  };

  const handleProductImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const productIdForLookup = event.target.value;
    if (productIdForLookup !== "") {
      fetchProductImageDetailsWithId(productIdForLookup)
        .then((image) => {
          if (image !== undefined) {
            setProductImage(image);
            console.log(image);
          } else {
            setProductImage({
              Id: Number(productIdForLookup),
              Link: product_card_missing,
            });
          }
        })
        .catch((_err) => {
          setProductImage({
            Id: Number(productIdForLookup),
            Link: product_card_missing,
          });
        });
    }
  };

  return (
    <div className="text-neutral-200">
      <form onSubmit={handleFormSubmit}>
        <div className="sm:flex-row sm:flex">
          <div className="sm:w-8/12 mr-2">
            <div className="flex flex-col">
              <label className="mb-2 hidden" htmlFor="product-name">
                Product name
              </label>
              <input
                required
                className="w-full bg-gray-600 box-border outline-none text-neutral-200
        hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
                type="text"
                name="product-name"
                id="product-name"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="flex flex-col mt-4">
              <label className="hidden" htmlFor="product-desc">
                Product description
              </label>
              <textarea
                required
                className="resize-none h-60 sm:h-72 lg:h-80 text-neutral-200 w-full bg-gray-600 box-border outline-none
          hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
                name="product-desc"
                id="product-desc"
                placeholder="Product description"
                value={
                  productDescription === null ||
                  productDescription === undefined
                    ? ""
                    : productDescription
                }
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
          </div>
          <hr className="mb-4 mt-6" />
          <div className="sm:flex sm:flex-col sm:justify-center sm:items-center sm:ml-auto sm:mr-auto">
            <h2 className="text-2xl underline font-bold sm:hidden">
              Product Image
            </h2>
            <div className="justify-center flex flex-col items-center">
              <img
                className="my-4 sm:mt-0 sm:mb-2"
                src={
                  productImage === undefined
                    ? product_card_missing
                    : productImage.Link
                }
                alt="Upload preview"
                width={240}
                height={360}
              />
              <input
                className="flex-1 text-neutral-200 w-full bg-gray-600 box-border outline-none rounded-2xl px-4 py-2"
                type="number"
                min={0}
                value={productImage === undefined ? "" : productImage.Id}
                onChange={(e) => handleProductImageChange(e)}
              ></input>
            </div>
          </div>
        </div>
        <hr className="mt-6 mb-4" />
        <div>
          <h2 className="text-2xl underline font-bold mb-2">Sites</h2>
          {productSites.map((site, index) => (
            <div key={index} className="flex mb-4">
              <div className="flex flex-row flex-1">
                <input
                  className="flex-1 text-neutral-200 w-full bg-gray-600 box-border outline-none
                disabled:bg-gray-500 cursor-not-allowed rounded-2xl px-4 py-2"
                  type="url"
                  name="site"
                  value={site.Link}
                  disabled
                />
              </div>
              <div className="flex flex-row ml-2 mr-2 text-red-500 text-2xl">
                <button type="button" onClick={() => handleDeleteSite(index)}>
                  <IoTrashOutline />
                </button>
              </div>
            </div>
          ))}
        </div>
        <hr className="mb-4 mt-6" />
        <div>
          <div className="flex flex-col">
            <h2 className="text-2xl underline font-bold">Add Site</h2>
          </div>
          <div className="flex flex-col mt-4">
            <input
              className="text-neutral-200 w-full bg-gray-600 box-border outline-none
          hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
              type="url"
              name="site"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Site URL"
            />
          </div>
          <div className="flex flex-col mt-4">
            <button
              className="px-8 w-full sm:w-max py-1 rounded-full font-semibold uppercase
          bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
          hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
          hover:duration-300 hover:transition hover:text-gray-800
          focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
              type="button"
              onClick={handleAddSite}
            >
              Add
            </button>
          </div>
        </div>
        <hr className="mb-4 mt-6" />
        <div>
          <p className="text-red-500 text-base font-medium italic animate-pulse text-center mb-4"></p>
          <button
            className="px-8 w-full py-1 rounded-full font-semibold uppercase
          bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
          hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
          hover:duration-300 hover:transition hover:text-gray-800
          focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageProductForm;
