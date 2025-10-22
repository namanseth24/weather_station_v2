import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import SignupPage from "../components/SignupPage.vue";
import ForgotPage from "../components/ForgotPage.vue";
import DashboardPage from "../components/DashboardPage.vue";

const routes = [
  { path: "/", component: LoginPage },
  { path: "/signup", component: SignupPage },
  { path: "/forgot", component: ForgotPage },
  { path: "/dashboard", component: DashboardPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;
// Debug: Log route changes
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path);
  next();
});
