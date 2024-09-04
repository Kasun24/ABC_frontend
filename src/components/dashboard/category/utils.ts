import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import {
  ExtraHeadersType,
  ExtraType,
} from "@/components/dashboard/category/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "categories",
    disabled: true,
  },
];

export const categoryHeaders: TableHeaderType[] = [
  { title: "ID" },
  { title: "Category" },
  { title: "Status" },
  { title: "Action", align: "end" },
];


export const statusOptions: MenuSelectItemType[] = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
];
export const promotionOptions: MenuSelectItemType[] = [
  { value: "true", label: "True" },
  { value: "false", label: "False" }, 
];

export const extraAddons: ExtraType[] = [
  {
    id: 1,
    name: "Extra Addon 1",
    addonOptional: "addon",
  },
  {
    id: 2,
    name: "Extra Addon 2",
    addonOptional: "addon",
  },
  {
    id: 3,
    name: "Extra Addon 3",
    addonOptional: "addon",
  },
];
export const extraTableHeaders: ExtraHeadersType[] = [
  { title: "ID", sortable: true, align: "start", key: "id" },
  { title: "Name", key: "name" },
  { title: "AddonOptional", key: "addonOptional" },
  { title: "Action", key: "action" },
];
export const extraOptions: MenuSelectItemType[] = [
  { value: "addon", label: "Add-on" },
  { value: "optional", label: "Optional" },
];
