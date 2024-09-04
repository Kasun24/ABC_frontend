import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar7,
  Avatar8,
} from "@/assets/images/users/utils";
import { AssigneeImgType } from "@/components/dashboard/roles/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "system-settings",
    disabled: false,
  },
  {
    title: "roles",
    disabled: true,
  },
];

export const roleHeaders: TableHeaderType[] = [
  { title: "Role" },
  { title: "Assigned Users" },
  { title: "Status" },
  { title: "Action", align: "end" },
];

export const avatars: AssigneeImgType[] = [
  {
    id: "avatar1",
    assigneeImg: Avatar1,
    assigneeName: "Stefanie Cartwright",
  },
  {
    id: "avatar2",
    assigneeImg: Avatar2,
    assigneeName: "Marisol Gaylord",
  },
  {
    id: "avatar3",
    assigneeImg: Avatar1,
    assigneeName: "Stefanie Cartwright",
  },
  {
    id: "avatar4",
    assigneeImg: Avatar2,
    assigneeName: "Marisol Gaylord",
  },
  {
    id: "avatar5",
    assigneeImg: Avatar3,
    assigneeName: "Merlin Heaney",
  },
  {
    id: "avatar6",
    assigneeImg: Avatar4,
    assigneeName: "Alexys Collier",
  },
  {
    id: "avatar7",
    assigneeImg: Avatar5,
    assigneeName: "Kyla O'Hara",
  },
  {
    id: "avatar8",
    assigneeImg: Avatar6,
    assigneeName: "Twila Stark",
  },
  {
    id: "avatar9",
    assigneeImg: Avatar7,
    assigneeName: "Bennett Rice",
  },
  {
    id: "avatar10",
    assigneeImg: Avatar8,
    assigneeName: "Dusty Hackett",
  },
];

export const rolePermission = [
  {
    id: 1,
    label: "User Management",
    permissions: [
      { id: 1, label: "View Users" },
      { id: 2, label: "Edit Users" },
      { id: 3, label: "Delete Users" },
    ],
  },
  {
    id: 2,
    label: "Product Management",
    permissions: [
      { id: 4, label: "View Products" },
      { id: 5, label: "Edit Products" },
      { id: 6, label: "Delete Products" },
    ],
  },
  {
    id: 3,
    label: "Category Management",
    permissions: [
      { id: 7, label: "View Category" },
      { id: 8, label: "Edit Category" },
      { id: 9, label: "Delete Category" },
    ],
  },
];
export const statusOptions: MenuSelectItemType[] = [
  { value: 1, label: "Active" },
  { value: 0, label: "Inactive" },
];
