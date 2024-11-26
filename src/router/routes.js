const routes = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'), // Layout para login
    children: [
      {
        path: '', // Página por defecto
        component: () => import('pages/PaginaLogin.vue'), // Tu formulario de login
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/PaginaRegistroVector',
        component: () => import('pages/PaginaRegistroVector.vue'),
      },
      {
        path: '/PaginaValidacionLaboratorio',
        component: () => import('pages/PaginaValidacionLaboratorio.vue'),
      },
      {
        path: '/PaginaRegistroUsuarios',
        component: () => import('pages/PaginaRegistroUsuarios.vue'),
      },
      {
        path: '/PaginaRegistroDatos',
        component: () => import('pages/PaginaRegistroDatos.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
