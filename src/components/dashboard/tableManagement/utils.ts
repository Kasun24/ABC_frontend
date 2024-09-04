import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "table-management",
    disabled: true,
  },
];

export const areaColors: MenuSelectItemType[] = [
  { value: "black", label: "Black" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
];
