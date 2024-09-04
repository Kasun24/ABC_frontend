import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

import {
  Img1,
  Img2,
  Img6,
  Img7,
  Img8,
} from "@/assets/images/products/utils";
import { FilterType} from "@/components/dashboard/pos/types";

export const checkoutBreadcrumb: BreadcrumbType[] = [
  {
    title: "pos",
    disabled: false,
  },
  {
    title: "checkout",
    disabled: true,
  },
];

export const filter: FilterType = {
  query: "",
  category: "",
  discount: "",
};

export const extraAdd = [
  {
    title: "Extra Clilli",
    value: 50,
  },
  {
    title: "Extra Sauce",
    value: 60,
  },
  {
    title: "Extra Honey",
    value: 70,
  },
  {
    title: "Extra Cheese",
    value: 100,
  },
];
export const productSizes = ["Small", "Medium", "Large"];

export const productImages = [
  { src: Img1, id: "Img1" },
  { src: Img7, id: "Img7" },
  { src: Img8, id: "Img8" },
  { src: Img2, id: "Im2" },
  { src: Img6, id: "Img6" },
];

export const payTypes = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
];
