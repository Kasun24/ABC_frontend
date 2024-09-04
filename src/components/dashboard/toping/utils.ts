import { TableHeaderType } from "@/app/common/types/table.types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "toping",
    disabled: true,
  },
];

export const topingHeaders: TableHeaderType[] = [
  { title: "Name" },
  { title: "Status" },
  { title: "Action", align: "end" },
];

export const defaultPriceHeaders: TableHeaderType[] = [
  { title: "#" },
  { title: "Delivery" },
  { title: "Pickup" },
  { title: "DineIn", align: "center" },
];
export const statusOptions: MenuSelectItemType[] = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];