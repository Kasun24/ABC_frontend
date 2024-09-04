export type CategoryListingType = {
  isChecked?: boolean;
  id: number;
  name: string;
  tax: number;
  is_promotion: string;
  discounts_disabled: string;
  exclude_min_order_amount_cal: string;
  disabled_for_pickup: string;
  disabled_for_dine_in: string;
  disabled_for_delivery: string;
  description: string;
  status: string;
  isPromotion: string;
  restaurantData: {
    discount: boolean;
    minCal: boolean;
    pickup: boolean;
    dinein: boolean;
    delivery: boolean;
  };
  visibility: {
    day: string;
    allday: boolean;
    start: {
      hour: number;
      minute: number;
    };
    end: {
      hour: number;
      minute: number;
    };
  }[];
  images: {
    webImg: string;
    appImg: string;
    promotionImg: string;
  };
  extras: {
    id: number;
    name: string;
    addonOptional: string;
  }[];
};

export type ExtraType = {
  id: number;
  name: string;
  addonOptional: string;
};
export type ExtraHeadersType = {
  title: string;
  align?: string;
  sortable?: boolean;
  key: string;
};
