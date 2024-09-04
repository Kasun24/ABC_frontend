import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "customer",
    disabled: true,
  },
];

export const customerHeaders: TableHeaderType[] = [
  { title: "Name" },
  { title: "Phone Number" },
  { title: "Email" },
  {
    title: "Action",
    align: "end",
  },
];
