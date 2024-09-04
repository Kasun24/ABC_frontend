import { genaralSettings } from "@/app/common/commonFunctions";
import {
  Checkout,
  Kitchen,
  Orders,
  Products,
  Reports,
  Tables,
} from "@/assets/images/modules/utils";
import { Img1, Img10, Img5 } from "@/assets/images/products/utils";
import { Avatar2, Avatar8 } from "@/assets/images/users/utils";
import {
  BrandsListType,
  CartItemType,
  MenuItemType,
  NotificationType,
} from "@/components/layouts/types";

export let menuItems: MenuItemType[] = [];

const menuItems1: MenuItemType[] = [
  {
    label: "menu",
    isHeader: true,
    id: "HeaderMenu",
  },
  {
    label: "dashboard",
    id: "sideBarDashboard",
    icon: "ph-gauge",
    link: "/",
  },
  {
    label: "branches",
    id: "sideBarBranches",
    icon: "ph-share-network",
    link: "/system/branches",
  },
  {
    label: "product-management",
    id: "sideBarProduct",
    icon: "ph-cube",
    prefix: "/product",
    subMenu: [
      { label: "toping", link: "/toping" },
      { label: "toping-scenario", link: "/toping-scenario" },
      { label: "category", link: "/category" },
      { label: "product", link: "/product" },
    ],
  },
  {
    label: "table-management",
    id: "sideBarTableManagement",
    icon: "ph-dice-four",
    link: "/table-management",
  },
  {
    label: "orders",
    id: "sideBarOrders",
    icon: "ph-table",
    link: "/order",
  },
  {
    label: "pos",
    id: "sideBarPos",
    icon: "ph-storefront",
    link: "/pos/dine-in",
    condition: "is_winorder_mode",
  },

  {
    label: "customer",
    id: "sideBarPos",
    icon: "ph-user-circle-fill",
    link: "/customer",
  },
  {
    label: "user-management",
    icon: "ph-users",
    id: "sideBarUserRoles",
    prefix: "/system",
    subMenu: [
      { label: "roles", link: "/system/roles" },
      { label: "users", link: "/system/users" },
    ],
  },

  {
    label: "logs",
    id: "sideBarLogs",
    icon: "ph-files",
    prefix: "/logs",
    subMenu: [{ label: "client-logs", link: "/system/client-logs" }],
  },
];

menuItems = menuItems1;

// New system settings menu
export const systemSettingMenu: MenuItemType[] = [];

export const brandsList: BrandsListType[] = [
  { src: Tables, title: "Tables", link: "/table-management" },
  { src: Checkout, title: "POS", link: "/pos/dine-in" },
  { src: Kitchen, title: "Kitchen", link: "/kitchen" },
  { src: Orders, title: "Orders", link: "/order" },
  { src: Products, title: "Products", link: "/product" },
];

export const cartItems: CartItemType[] = [
  {
    id: 1,
    src: Img1,
    subTitle: "Fashion",
    title: "Blive Printed Men Round Neck",
    price: 327.49,
    items: 2,
  },
  {
    id: 2,
    src: Img5,
    subTitle: "Sportwear",
    title: "Willage Volleyball Ball",
    price: 49.06,
    items: 3,
  },
  {
    id: 3,
    src: Img10,
    subTitle: "Fashion",
    title: "Cotton collar t-shirts for men",
    price: 53.33,
    items: 3,
  },
];

export const notifications: NotificationType[] = [
  {
    isSelected: false,
    id: "unread-1",
    src: Avatar2,
    title: "Angela Bernier",
    message: "Answered to your comment on the cash flow forecast's graph 🔔.",
    time: "48 min ago",
    isRead: false,
  },
  {
    isSelected: false,
    id: "unread-2",
    icon: "bx bx-badge-check bx-xs",
    message: `<h4>Your <b>Elite</b> author Graphic
    Optimization <span class="text-secondary">reward</span> is ready!</h4>`,
    time: "Just 30 sec ago",
    isRead: false,
  },
  {
    isSelected: false,
    id: "unread-3",
    icon: "bx bx-message-square-dots",
    message: `<h4>You have received <b class="text-success">20</b> new messages in the conversation</h4>`,
    time: "2 hrs ago",
    isRead: false,
  },

  {
    isSelected: false,
    id: "read-1",
    src: Avatar8,
    title: "Maureen Gibson",
    message: "We talked about a project on linkedin.",
    time: "4 hrs ago",
    isRead: true,
  },
];
