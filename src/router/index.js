import { route } from "quasar/wrappers";
import {
  createRouter,
  createWebHistory,
} from "vue-router";
import routes from "./routes";

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(),
  });

  // Guard de navegación global
  Router.beforeEach((to, from, next) => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Rutas protegidas
    const protectedRoutes = {
      1: ["/PaginaRegistroVector", "/PaginaValidacionLaboratorio", "/PaginaRegistroUsuarios", "/PaginaRegistroDatos"], // Admin
      2: ["/PaginaRegistroDatos", "/PaginaRegistroVector"], // Registrador
      3: ["/PaginaValidacionLaboratorio", "/PaginaRegistroDatos"], // Laboratorio
    };

    const allowedRoutes = protectedRoutes[user?.rol_id] || [];

    if (to.path !== "/login" && !allowedRoutes.includes(to.path)) {
      next("/login"); // Redirige al login si no tiene acceso
    } else {
      next(); // Permite la navegación
    }
  });

  return Router;
});
