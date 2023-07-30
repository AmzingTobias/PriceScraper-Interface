/**
 * Remove trailing whitespace from a product name, and then validate it's not empty
 * @param product_name - The product name to trim and then validate
 * @returns [True if the product name is valid, False otherwise, The trimmed product name]
 */
export function validate_product_name(product_name: string): [boolean, string] {
  // Check if the product name is empty
  product_name = product_name.trim();
  if (product_name.length === 0) {
    return [false, product_name];
  } else {
    return [true, product_name];
  }
}

export const PRODUCT_NAME_INVALID_MSG = "Product name invalid";
export const PRODUCT_NAME_MISSING_MSG = "Product name missing in body";
export const PRODUCT_ID_MISSING_MSG = "Product ID missing in request";
