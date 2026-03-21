// Product types
export type tProductEntry = {
  Id: number;
  Name: string;
  Description: string;
};

// Price types
export type tPriceEntry = {
  Price: number;
  Date: number;
  Site_link: string;
};

// Site types
export type tSiteEntry = {
  Id: number;
  Link: string;
  ProductId: number;
};

// Image types
export type tImageEntry = {
  Id: number;
  Link: string;
};

// Notification types
export type tUserNotificationSettings = {
  Enabled: boolean;
};

export type TProductList = {
  ProductId: number;
}[];

// User types
export type TUserDetails = {
  Username: string;
};

// Product card (client-side)
export type TProductCard = {
  id: number;
  name: string;
  image_link: string | null;
};
