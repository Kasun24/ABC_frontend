import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "dashboard",
    disabled: false,
  },
  {
    title: "orders",
    disabled: true,
  },
];

export const orderHeaders: TableHeaderType[] = [
  { title: "Payment ID" },
  { title: "Status" },
  { title: "Order Table" },
  { title: "Gross Total", align: "end" },
  { title: "Action", align: "end" },
];

export const orderStatus: MenuSelectItemType[] = [
  { value: "processing", label: "Processing " },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  // { value: "paid", label: "Paid" },
  // { value: "accepted", label: "Accepted" },
  // { value: "rejected", label: "Rejected" },
];
