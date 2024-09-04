import { array } from "@amcharts/amcharts5";

export type FilterType = {
  query: string;
  category: string;
  discount: string;
};

export type ProductGridType = {
  id: number | string;
  dine_in: number;
  delivery: number;
  pickup: number;
  dish_number: string;
  src: string;
  is_size: string;
  is_combo: string;
  is_customise: string;
  name: string;
  category: string;
  sizes: any;
  scenarios: any;
  quantity: number;
  discount: number;
  orders: string;
  ratings: string;
  position: number;
  status: string;
  tax: any;
  type: string;
  count: number;
  branch_id: number;
};

export type CartItemType = {
  dish_id: number | string;
  src: string;
  dish_name: string;
  category: string;
  dish_price: number;
  status: string;
  gross_total_with_discount: number;
  count: number;
  toppings: CartItemToppingType[];
  customer_device: customer_deviceType;
};
type customer_deviceType = {
  customer_name: string;
};
type CartItemToppingType = {
  topping_name: string;
  count: number;
};

export type ImageType = {
  id: number;
  src: string;
  formattedSize: string;
  path: string;
  size: string;
};

export type TableDataType = {
  id?: number;
  branch_id?: number;
  table_number?: number;
  name: string;
  type: "table" | "tableZone";
  elementId: string;
  classes: string[];
  locationX: number;
  locationY: number;
  width: number;
  height: number;
  relatedArea?: string;
  addedTables?: string[];
  color?: string;
  orderInProgress: boolean;
};
