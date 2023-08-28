import { tImageEntry } from "../../../server/models/image.models";
import { tProductEntry } from "../../../server/models/product.models";
import { tSiteEntry } from "../../../server/models/site.models";
import product_card_missing from "../assets/product_card_missing.png";

export const fetchProductDetails = (
  productId: string
): Promise<tProductEntry> => {
  return new Promise(async (resolve, reject) => {
    try {
      const productResponse = await fetch(`/api/products/${productId}`);
      if (productResponse.ok) {
        const productJson: tProductEntry = await productResponse.json();
        resolve(productJson);
      } else {
        reject("Error");
      }
    } catch {
      reject("Error");
    }
  });
};

export const fetchProductImageDetailsWithProductId = (
  productId: string
): Promise<tImageEntry | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageResponse = await fetch(`/api/images/product/${productId}`);
      if (imageResponse.ok) {
        const imageJson: tImageEntry = await imageResponse.json();
        if (imageJson === null) {
          resolve(undefined);
        } else {
          resolve(imageJson);
        }
      } else {
        reject("Error with image request");
      }
    } catch {
      reject("Error with image request");
    }
  });
};

export const fetchProductImageDetailsWithId = (
  imageId: string | number
): Promise<tImageEntry | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageResponse = await fetch(`/api/images/${imageId}`);
      if (imageResponse.ok) {
        const imageJson: tImageEntry = await imageResponse.json();
        if (imageJson === null) {
          resolve(undefined);
        } else {
          resolve(imageJson);
        }
      } else {
        reject("Error with image request");
      }
    } catch {
      reject("Error with image request");
    }
  });
};

export const fetchProductSites = (productId: string): Promise<tSiteEntry[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const productSitesResponse = await fetch(
        `/api/sites?ProductId=${productId}`
      );
      if (productSitesResponse.ok) {
        const productSitesJson = productSitesResponse.json();
        resolve(productSitesJson);
      } else {
        reject("Error getting sites");
      }
    } catch {
      reject("Error in request");
    }
  });
};

export const deleteSites = (sitesToDelete: tSiteEntry[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (sitesToDelete.length > 0) {
      sitesToDelete.forEach((site) => {
        fetch(`/api/sites/${site.Id}`, { method: "DELETE" })
          .then((response) => {
            resolve(response.ok);
          })
          .catch((err) => {
            reject(err);
          });
      });
    } else {
      resolve(true);
    }
  });
};

export const createSites = (sitesToCreate: tSiteEntry[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (sitesToCreate.length > 0) {
      sitesToCreate.forEach((newSite) => {
        fetch("/api/sites", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            "Site Link": newSite.Link,
            ProductId: newSite.ProductId,
          }),
        })
          .then((response) => resolve(response.ok))
          .catch((err) => reject(err));
      });
    } else {
      resolve(true);
    }
  });
};

export const linkImageToProduct = (
  productId: number | string,
  imageId: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fetch(`/api/images/product/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        ImageId: imageId,
      }),
    })
      .then((response) => resolve(response.ok))
      .catch((err) => reject(err));
  });
};

export const updateProductName = (
  productId: number | string,
  new_name: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fetch(`/api/products/name/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: new_name }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => resolve(response.ok))
      .catch((err) => reject(err));
  });
};

export const updateProductDescription = (
  productId: number | string,
  new_description: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fetch(`/api/products/description/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ description: new_description }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => resolve(response.ok))
      .catch((err) => reject(err));
  });
};
