import { createRouter, createWebHistory } from "vue-router";
import UserLogin from "../components/UserLogin.vue";
import UserRegister from "../components/UserRegister.vue";
import ProductList from "@/components/ProductList.vue";
import Dashboard from "../components/DashboardPage.vue";
import HomePage from "@/components/HomePage.vue";
import CategoryList from "@/components/CategoryList.vue";
import CartList from "@/components/CartList.vue";

const routes = [
  { path: "/", component: HomePage },
  {
    path: "/admin/products",
    component: ProductList,
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    component: CategoryList,
    meta: { requiresGuest: false },
  },
  {
    path: "/products",
    component: ProductList,
    meta: { requiresGuest: false },
  },
  {
    path: "/cart",
    component: CartList,
    meta: { requiresAuth: true },
  },
  {
    path: "/products/create",
    component: () => import("@/components/ProductForm.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/products/edit/:id",
    component: () => import("@/components/ProductForm.vue"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: UserLogin,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    component: UserRegister,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // Loại bỏ các tham số không sử dụng
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("tokenExpiry");

  // Kiểm tra token hết hạn và xóa token nếu hết hạn
  if (token && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    // Redirect to login page after token expiry
    next("/login");
    return;
  }

  // Kiểm tra route yêu cầu khách (requiresGuest) và token đã tồn tại
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (token) {
      // Nếu người dùng đã đăng nhập, chuyển hướng đến trang dashboard
      next("/dashboard");
      return;
    }
  }

  // Kiểm tra route yêu cầu xác thực (requiresAuth) và token không tồn tại
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // Lưu trang hiện tại để điều hướng sau khi đăng nhập
      localStorage.setItem("redirectTo", to.fullPath);
      next("/login");
      return;
    }
  }

  // Log navigation (chỉ trong môi trường development)
  if (process.env.NODE_ENV === "development") {
    console.log(`Navigating from ${from.path} to ${to.path}`);
  }

  // Cho phép điều hướng tiếp tục
  next();
});

export default router;
