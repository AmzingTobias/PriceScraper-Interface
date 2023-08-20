import { FormEvent, useEffect, useState } from "react";
import product_card_missing from "../../assets/product_card_missing.png";
import { IoTrashOutline } from "react-icons/io5";

const NewProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productImageUrl, setProductImageUrl] = useState(product_card_missing);
  const [imageData, setImageData] = useState<File>();
  const [newSite, setNewSite] = useState<string>("");
  const [siteLinks, setSiteLinks] = useState<string[]>([]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (imageData !== undefined) {
      const read = new FileReader();
      read.onload = (e) => {
        if (typeof e.target?.result !== "string") {
          setProductImageUrl(product_card_missing);
        } else {
          setProductImageUrl(e.target.result);
        }
      };

      read.readAsDataURL(imageData);
    } else {
      setProductImageUrl(product_card_missing);
    }
  }, [imageData]);

  const handleAddSite = () => {
    if (newSite !== "") {
      setSiteLinks((previous) => [...previous, newSite]);
      setNewSite("");
    }
  };

  const handleDeleteSite = (index: number) => {
    if (siteLinks.length > 0 && index < siteLinks.length) {
      const newSiteLinks = [...siteLinks];
      newSiteLinks.splice(index, 1); // Remove 1 element at the specified index
      setSiteLinks(newSiteLinks);
    }
  };

  return (
    <>
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
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
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
                  src={productImageUrl}
                  alt="Uploaded image"
                  width={240}
                  height={360}
                />
                <input
                  id="image"
                  className="file opacity-0 h-0 w-0"
                  accept="image/*"
                  onChange={(e) =>
                    setImageData(
                      e.target.files !== null ? e.target.files[0] : undefined
                    )
                  }
                  type="file"
                />
                <label
                  htmlFor="image"
                  className="border-yellow-400 bg-transparent border-4 border-solid flex items-center justify-center
                text-neutral-200 font-semibold cursor-pointer rounded-full px-8 py-1 relative w-full
                hover:shadow-fillInsideRoundedFull hover:shadow-yellow-400 hover:text-gray-800 hover:border-yellow-400  "
                >
                  Select Image
                </label>
              </div>
            </div>
          </div>
          <hr className="mt-6 mb-4" />
          <div>
            <h2 className="text-2xl underline font-bold mb-2">Sites</h2>
            {siteLinks.map((site, index) => (
              <div key={index} className="flex mb-4">
                <div className="flex flex-row flex-1">
                  <input
                    className="flex-1 text-neutral-200 w-full bg-gray-600 box-border outline-none
                    disabled:bg-gray-500 cursor-not-allowed rounded-2xl px-4 py-2"
                    type="url"
                    name="site"
                    value={site}
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
            <button
              className="px-8 w-full py-1 rounded-full font-semibold uppercase
              bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
              hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
              hover:duration-300 hover:transition hover:text-gray-800
              focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewProductForm;
