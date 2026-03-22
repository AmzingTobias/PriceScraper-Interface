import {
  tProductEntry,
  tPriceEntry,
  tSiteEntry,
  tImageEntry,
  tUserNotificationSettings,
  TProductList,
  TUserDetails,
  TProductCard,
} from "./types";
import {
  cacheGet,
  cacheHas,
  cacheSet,
  cacheDelete,
  CacheKeys,
  TTL,
} from "./cache";

// ── Auth-aware fetch ──
// The auth cookie is sent automatically by the browser on same-origin requests
// and through Vercel's rewrite proxy. No explicit header needed.
// This alias exists for readability — to distinguish auth vs public endpoints.

function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}

// ── Products ──

export async function fetchAllProducts(): Promise<tProductEntry[]> {
  const cached = cacheGet<tProductEntry[]>(CacheKeys.allProducts());
  if (cached) return cached;

  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: tProductEntry[] = await res.json();
  cacheSet(CacheKeys.allProducts(), data, TTL.PRODUCT_LIST);
  return data;
}

export async function fetchProductDetails(productId: string): Promise<tProductEntry> {
  const key = CacheKeys.productDetail(productId);
  const cached = cacheGet<tProductEntry>(key);
  if (cached) return cached;

  const res = await fetch(`/api/products/${productId}`);
  if (!res.ok) throw new Error("Product not found");
  const data: tProductEntry = await res.json();
  cacheSet(key, data, TTL.PRODUCT_DETAIL);
  return data;
}

export async function updateProductName(productId: string | number, name: string): Promise<boolean> {
  const res = await authFetch(`/api/products/name/${productId}`, {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    cacheDelete(CacheKeys.productDetail(String(productId)));
    cacheDelete(CacheKeys.productCards());
    cacheDelete(CacheKeys.allProducts());
  }
  return res.ok;
}

export async function updateProductDescription(productId: string | number, description: string): Promise<boolean> {
  const res = await authFetch(`/api/products/description/${productId}`, {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (res.ok) {
    cacheDelete(CacheKeys.productDetail(String(productId)));
  }
  return res.ok;
}

export async function deleteProduct(productId: string | number): Promise<boolean> {
  const res = await authFetch(`/api/products/${productId}`, { method: "DELETE" });
  if (res.ok) {
    cacheDelete(CacheKeys.productDetail(String(productId)));
    cacheDelete(CacheKeys.productPrices(String(productId)));
    cacheDelete(CacheKeys.productImage(String(productId)));
    cacheDelete(CacheKeys.allProducts());
    cacheDelete(CacheKeys.productCards());
  }
  return res.ok;
}

// ── Prices ──

export async function fetchProductPrices(productId: string): Promise<tPriceEntry[]> {
  const key = CacheKeys.productPrices(productId);
  const cached = cacheGet<tPriceEntry[]>(key);
  if (cached) return cached;

  const res = await fetch(`/api/prices/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch prices");
  const data: tPriceEntry[] = await res.json();
  cacheSet(key, data, TTL.PRODUCT_PRICES);
  return data;
}

// ── Sites ──

export async function fetchProductSites(productId: string): Promise<tSiteEntry[]> {
  const res = await authFetch(`/api/sites?ProductId=${productId}`);
  if (!res.ok) throw new Error("Failed to fetch sites");
  return res.json();
}

export async function deleteSite(siteId: number): Promise<boolean> {
  const res = await authFetch(`/api/sites/${siteId}`, { method: "DELETE" });
  return res.ok;
}

export async function createSite(link: string, productId: number): Promise<boolean> {
  const res = await authFetch("/api/sites", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ "Site Link": link, ProductId: productId }),
  });
  return res.ok;
}

// ── Images ──

export async function fetchProductImage(productId: string): Promise<tImageEntry | null> {
  const key = CacheKeys.productImage(productId);
  if (cacheHas(key)) return cacheGet<tImageEntry | null>(key);

  const res = await fetch(`/api/images/product/${productId}`);
  if (!res.ok) return null;
  const data: tImageEntry | null = await res.json();
  cacheSet(key, data, TTL.PRODUCT_IMAGE);
  return data;
}

export async function fetchImageById(imageId: string | number): Promise<tImageEntry | null> {
  const res = await fetch(`/api/images/${imageId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAllImages(): Promise<tImageEntry[]> {
  const res = await authFetch("/api/images");
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export async function uploadImage(file: File): Promise<boolean> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await authFetch("/api/images/", { method: "POST", body: formData });
  return res.ok;
}

export async function deleteImage(imageId: number): Promise<boolean> {
  const res = await authFetch(`/api/images/${imageId}`, { method: "DELETE" });
  return res.ok;
}

export async function linkImageToProduct(productId: string | number, imageId: number): Promise<boolean> {
  const res = await authFetch(`/api/images/product/${productId}`, {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ ImageId: imageId }),
  });
  if (res.ok) {
    cacheDelete(CacheKeys.productImage(String(productId)));
    cacheDelete(CacheKeys.productCards());
  }
  return res.ok;
}

// ── Users / Auth ──

export async function login(username: string, password: string): Promise<string | null> {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

export async function signup(username: string, password: string): Promise<string | null> {
  const res = await fetch("/api/users/signup", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

export async function isUserAdmin(): Promise<boolean> {
  try {
    const res = await authFetch("/api/users/admin");
    if (!res.ok) return false;
    return res.json();
  } catch {
    return false;
  }
}

export async function getUserDetails(): Promise<TUserDetails | null> {
  try {
    const res = await authFetch("/api/users");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const res = await authFetch("/api/users/change-password", {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  return res.ok;
}

// ── Notifications ──

export async function isNotifiedForProduct(productId: string): Promise<boolean> {
  try {
    const res = await authFetch(`/api/notifications/product/${productId}`);
    if (!res.ok) return false;
    return res.json();
  } catch {
    return false;
  }
}

export async function enableProductNotification(productId: number): Promise<boolean> {
  const res = await authFetch("/api/notifications/link", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ ProductId: productId }),
  });
  return res.ok;
}

export async function disableProductNotification(productId: number): Promise<boolean> {
  const res = await authFetch("/api/notifications/link", {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ ProductId: productId }),
  });
  return res.ok;
}

export async function getNotifiedProducts(): Promise<TProductList> {
  try {
    const res = await authFetch("/api/notifications/user/product");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getNotificationSettings(): Promise<tUserNotificationSettings> {
  try {
    const res = await authFetch("/api/notifications/user");
    if (!res.ok) return { Enabled: false };
    return res.json();
  } catch {
    return { Enabled: false };
  }
}

export async function updateNotificationSettings(enabled: boolean): Promise<boolean> {
  const res = await authFetch("/api/notifications/user", {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ Enable: enabled }),
  });
  return res.ok;
}

// ── Discord ──

export async function getDiscordWebhook(): Promise<string | undefined> {
  try {
    const res = await authFetch("/api/notifications/discord");
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.Webhook;
  } catch {
    return undefined;
  }
}

export async function createDiscordWebhook(webhook: string): Promise<boolean> {
  const res = await authFetch("/api/notifications/discord", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ Webhook: webhook }),
  });
  return res.ok;
}

export async function updateDiscordWebhook(webhook: string): Promise<boolean> {
  const res = await authFetch("/api/notifications/discord", {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ Webhook: webhook }),
  });
  return res.ok;
}

export async function deleteDiscordWebhook(): Promise<boolean> {
  const res = await authFetch("/api/notifications/discord", { method: "DELETE" });
  return res.ok;
}

// ── Scraper ──

export async function getScraperLog(): Promise<string[]> {
  try {
    const res = await authFetch("/api/scraper/log");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function importProduct(importLink: string): Promise<string | null> {
  const res = await authFetch("/api/scraper/import", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ import_link: importLink }),
  });
  if (res.ok) {
    cacheDelete(CacheKeys.allProducts());
    cacheDelete(CacheKeys.productCards());
    return res.text();
  }
  return null;
}

// ── Helpers ──

export function formatDateFromEpoch(epoch: number): string {
  const d = new Date(epoch * 1000);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

export async function fetchProductCards(): Promise<TProductCard[]> {
  const key = CacheKeys.productCards();
  const cached = cacheGet<TProductCard[]>(key);
  if (cached) return cached;

  const products = await fetchAllProducts();
  const cards = await Promise.all(
    products.map(async (product) => {
      const image = await fetchProductImage(String(product.Id));
      return {
        id: product.Id,
        name: product.Name,
        image_link: image ? `/uploads/${image.Link}` : null,
      };
    })
  );
  cacheSet(key, cards, TTL.PRODUCT_CARDS);
  return cards;
}
