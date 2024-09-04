import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

import { PrinterListingType } from "@/components/dashboard/printers/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "system-settings",
    disabled: false,
  },
  {
    title: "printers",
    disabled: true,
  },
];

export const printerHeaders: TableHeaderType[] = [
  {
    title: "Printer",
  },
  {
    title: "Action",
    align: "end",
  },
];

export const printerList: PrinterListingType[] = [
  {
    id: 1,
    name: "Printer 1",
  },
];
