import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tSiteEntry } from "../../../../server/models/site.models";
import {
  createSites,
  deleteSites,
  fetchProductDetails,
  fetchProductImageDetailsWithProductId,
  fetchProductSites,
  linkImageToProduct,
  updateProductDescription,
  updateProductName,
} from "../../common/products";
import product_card_missing from "../../assets/product_card_missing.png";
import ManageProductForm from "../../components/product/manage-product-form";
import { tImageEntry } from "../../../../server/models/image.models";

interface IManageProductPageProps {
  userIsAdmin: boolean;
}

const ManageProductPage: React.FC<IManageProductPageProps> = ({
  userIsAdmin,
}) => {
  const { productId } = useParams();
  const [productName, setProductName] = useState<string>();
  const [productDescription, setProductDescription] = useState<string>();
  const [productSites, setProductSites] = useState<tSiteEntry[]>([]);
  const [originalSites, setOriginalSites] = useState<tSiteEntry[]>([]);
  const [productImage, setProductImage] = useState<tImageEntry>();
  const navigate = useNavigate();

  const goToProductPage = () => {
    navigate(`/product/${productId}`, { replace: false });
  };

  useEffect(() => {
    if (productId === undefined) {
      return;
    }
    fetchProductDetails(productId)
      .then((productDetails) => {
        setProductName(productDetails.Name);
        setProductDescription(productDetails.Description);
      })
      .catch(() => {
        setProductName(undefined);
        setProductDescription(undefined);
      });

    fetchProductImageDetailsWithProductId(productId)
      .then((image) => {
        setProductImage(image);
      })
      .catch(() => {
        setProductImage(undefined);
      });

    fetchProductSites(productId)
      .then((sites) => {
        setOriginalSites(sites);
        setProductSites(sites);
      })
      .catch(() => {
        setOriginalSites([]);
        setProductSites([]);
      });
  }, []);

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (
        productId === undefined ||
        productName === undefined ||
        productDescription === undefined
      ) {
        return;
      }

      const nameUpdated = await updateProductName(productId, productName);
      if (!nameUpdated) {
        alert("Failed to update product name");
        return;
      }

      const descUpdated = await updateProductDescription(
        productId,
        productDescription
      );
      if (!descUpdated) {
        alert("Failed to update product description");
        return;
      }

      const sitesToDelete = originalSites.filter(
        (originalSite) =>
          !productSites.some((site) => site.Id === originalSite.Id)
      );

      const sitesDeleted = await deleteSites(sitesToDelete);
      if (!sitesDeleted) {
        alert("Failed to update removed sites");
        return;
      }

      const newSites = productSites.filter(
        (site) =>
          !originalSites.some((originalSite) => site.Id === originalSite.Id)
      );

      const sitesCreated = await createSites(newSites);
      if (!sitesCreated) {
        alert("Failed to create new sites");
        return;
      }

      if (productImage !== undefined && !Number.isNaN(productImage.Id)) {
        const imageLinked = await linkImageToProduct(
          productId,
          productImage.Id
        );
        if (!imageLinked) {
          console.error(productId, productImage.Id);
          alert("Failed to update new image");
          return;
        } else {
          if (window.confirm("Product updated")) {
            goToProductPage();
          }
        }
      } else {
        if (window.confirm("Product updated")) {
          goToProductPage();
        }
      }
    } catch (error) {
      // Handle general errors
      alert(`Error: ${error}`);
      console.error(error);
    }
  };

  if (!userIsAdmin || productId === undefined) {
    return <></>;
  }

  return (
    <>
      <div>
        <div className="flex flex-col items-center">
          <div
            className="
              w-11/12
              xl:w-4/5
              2xl:w-3/5
              my-8"
          >
            <div className="text-neutral-200 bg-gray-800 flex flex-col rounded-2xl px-2 py-4 lg:p-4">
              <h1 className="text-3xl underline font-bold mb-4">
                Manage Product
              </h1>
              <ManageProductForm
                productId={productId}
                productName={productName}
                setProductName={setProductName}
                productDescription={productDescription}
                setProductDescription={setProductDescription}
                productImage={productImage}
                setProductImage={setProductImage}
                productSites={productSites}
                setProductSites={setProductSites}
                handleFormSubmit={handleFormSubmit}
              />
              <button
                className="px-8 mt-4 mb-2 w-full py-1 rounded-full font-semibold uppercase
              bg-gray-800 border-red-500 border-solid border-4 text-neutral-200
                hover:shadow-fillInsideRoundedFull hover:shadow-red-500 hover:border-red-500 
                hover:duration-300 hover:transition hover:text-gray-800
              focus:border-neutral-200 focus:bg-red-500 focus:text-gray-800"
                onClick={goToProductPage}
                type="submit"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageProductPage;
