import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

import { QueryListingType } from "@/components/dashboard/queries/types";

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
    title: "Query",
  },
  {
    title: "Action",
    align: "end",
  },
];

export const queryList: QueryListingType[] = [
  {
    id: 1,
    name: "Query 1",
  },
];
