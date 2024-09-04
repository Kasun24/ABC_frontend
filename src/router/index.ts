import appConfigs from "@/app/appConfigurations";
import { backendService } from "@/app/http/httpServiceProvider";
import { routes } from "@/router/routes";
import { createRouter, createWebHistory, useRouter } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const title = appConfigs.appName;

router.beforeEach((to, from, next) => {
  const router = useRouter();

  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title + " | " + title || title;
  }

  const isAuthRequired = to.meta.authRequired;
  if (!isAuthRequired) {
    return next();
  }
  // const user = backendService.getUser();
  const user = localStorage.getItem("user_name") || 0;
  const isUserLoggedIn = Object.keys(user).length > 0;
  if (isAuthRequired && isUserLoggedIn) {
    next();
  } else {
    router.push("/login");
  }
});

export default router;
