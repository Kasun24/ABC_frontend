import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "users",
    disabled: true,
  },
];

export const userHeaders: TableHeaderType[] = [
  { title: "User" },
  { title: "Email" },
  { title: "Status" },
  { title: "Action", align: "end" },
];

export const statusOptions: MenuSelectItemType[] = [
  { value: 1, label: "Active" },
  { value: 0, label: "Inactive" },
];

export const currencyOptions: MenuSelectItemType[] = [
  { value: "€", label: "EURO" },
  { value: "$", label: "USD" },
];

export const currencyPositions: MenuSelectItemType[] = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
];

export const userLevels: MenuSelectItemType[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "waiter", label: "Waiter" },
  { value: "cashier", label: "Cashier" },
];
export const branchNamesTest: MenuSelectItemType[] = [
  { value: 1, label: "Test 1" },
  { value: 2, label: "Test 2" },
  { value: 3, label: "Test 3" },
];
