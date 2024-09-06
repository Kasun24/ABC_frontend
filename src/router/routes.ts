import { AuthLayout, DefaultLayout } from "@/layouts/index";

import Dashboard from "@/views/dashboard/Main.vue";

const accountRoutes = [
  {
    path: `/login`,
    name: "AccountLogIn",
    component: () => import("@/views/account/LogIn.vue"),
    meta: { title: "Log In", authRequired: false, layout: AuthLayout },
  },
  {
    path: `/forgot/password`,
    name: "ForgotPassword",
    component: () => import("@/views/account/ForgotPassword.vue"),
    meta: { title: "Forgot Password", authRequired: false, layout: AuthLayout },
  },
  {
    path: `/reset/password`,
    name: "ResetPassword",
    component: () => import("@/views/account/ResetPassword.vue"),
    meta: { title: "Reset Password", authRequired: false, layout: AuthLayout },
  },
];

const dashboardRoutes = [
  {
    path: "/",
    name: "Index",
    component: Dashboard,
    meta: { title: "Dashboard", authRequired: true, layout: DefaultLayout },
  },

  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: "Dashboard", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/pos/:type",
    name: "POS",
    component: () => import("@/views/dashboard/POS.vue"),
    meta: { title: "Dine-in", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/toping",
    name: "Toping",
    component: () => import("@/views/dashboard/Toping.vue"),
    meta: { title: "Toping", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/toping-scenario",
    name: "Toping scenario",
    component: () => import("@/views/dashboard/Toping_scenario.vue"),
    meta: {
      title: "Toping scenario",
      authRequired: true,
      layout: DefaultLayout,
    },
  },
  {
    path: "/customer",
    name: "Customer",
    component: () => import("@/views/dashboard/Customer.vue"),
    meta: { title: "Customer", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/category",
    name: "Category",
    component: () => import("@/views/dashboard/Category.vue"),
    meta: { title: "Category", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/product",
    name: "Product",
    component: () => import("@/views/dashboard/Product.vue"),
    meta: { title: "Product", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/table-management",
    name: "Table Management",
    component: () => import("@/views/dashboard/TableManagement.vue"),
    meta: { title: "Tables", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/order",
    name: "Order",
    component: () => import("@/views/dashboard/Order.vue"),
    meta: { title: "Orders", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/kitchen",
    name: "Kitchen",
    component: () => import("@/views/dashboard/Kitchen.vue"),
    meta: { title: "Kitchen", authRequired: true, layout: DefaultLayout },
  },

  {
    path: "/edit-profile",
    component: () => import("@/views/settings/general/EditProfile.vue"),
    meta: {
      title: "Edit Profile",
      authRequired: true,
      layout: DefaultLayout,
    },
  },
  {
    path: "/roles",
    component: () => import("@/views/dashboard/Roles.vue"),
    meta: { title: "Roles", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/users",
    component: () => import("@/views/dashboard/Users.vue"),
    meta: { title: "Users", authRequired: true, layout: DefaultLayout },
  },
  {
    path: "/branches",
    component: () => import("@/views/dashboard/Branches.vue"),
    meta: {
      title: "Branches",
      authRequired: true,
      layout: DefaultLayout,
    },
  },
  {
    path: "/queries",   
    component: () => import("@/views/dashboard/Query.vue"),
    meta: {
      title: "Queries",
      authRequired: true,
      layout: DefaultLayout,
    },
  },

  {
    path: "/tax",
    component: () => import("@/views/dashboard/Tax.vue"),
    meta: {
      title: "Tax",
      authRequired: true,
      layout: DefaultLayout,
    },
  },
  {
    path: "/client-logs",
    component: () => import("@/views/dashboard/ClientLogs.vue"),
    meta: {
      title: "Logs",
      authRequired: true,
      layout: DefaultLayout,
    },
  },
];

// System settings routes

export const routes = [...accountRoutes, ...dashboardRoutes];
