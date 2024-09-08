import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "queries",
    disabled: true,
  },
];

export const queryHeaders: TableHeaderType[] = [
  {
    title: "Customer",
  },
  {
    title: "Subject",
  },
  {
    title: "Message",
  },
  {
    title: "Status",
  },
  {
    title: "Action",
    align: "end",
  },
];
