import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "system-settings",
    disabled: false,
  },
  {
    title: "branches",
    disabled: true,
  },
];

export const branchHeaders: TableHeaderType[] = [
  {
    title: "Branch",
  },
  {
    title: "Action",
    align: "end",
  },
];
