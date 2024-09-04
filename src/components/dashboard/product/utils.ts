import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "products",
    disabled: true,
  },
];

export const productHeaders: TableHeaderType[] = [
  { title: "No" },
  { title: "Product Number" },
  { title: "Name" },
  { title: "Tax" },
  { title: "Status" },
  { title: "Action", align: "end" },
];

export const statusOptions: MenuSelectItemType[] = [
  { value: "active", label: "Active" },
  { value: "inActive", label: "Inactive" },
];

export const extraTableHeaders: TableHeaderType[] = [
  { title: "ID" },
  { title: "Name" },
  { title: "Action", align: "end" },
];

export const categories: MenuSelectItemType[] = [
  { value: "category 1", label: "Category 1" },
  { value: "category 2", label: "Category 2" },
  { value: "category 3", label: "Category 3" },
];
export const taxValues: MenuSelectItemType[] = [
  { value: "0", label: "Tax free" },
  { value: 10, label: "10%" },
  { value: 20, label: "20%" },
  { value: 30, label: "30%" },
];
export const alagics: MenuSelectItemType[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];
export const additives: MenuSelectItemType[] = [
  { value: "1", label: "Additive 1" },
  { value: "2", label: "Additive 2" },
  { value: "3", label: "Additive 3" },
  { value: "4", label: "Additive 4" },
];
export const extraOptions: MenuSelectItemType[] = [
  { value: "addon", label: "Add-on" },
  { value: "optional", label: "Optional" },
];
