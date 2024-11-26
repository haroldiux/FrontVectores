<template>
  <q-layout view="lHh Lpr fFf"> <!-- Cambié el valor del atributo `view` -->
    <!-- Header -->
    <q-header elevated class="bg-morado text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="text-white" />
        <q-toolbar-title>
          <span class="text-bold">UNITEPC</span>
        </q-toolbar-title>
        <q-space />
        <!-- Dropdown de usuario -->
        <q-btn-dropdown flat dense round icon="account_circle" aria-label="Opciones de usuario" class="text-white">
          <q-list separator>
            <q-item clickable>
              <q-item-section>
                <span class="text-bold">{{ currentUser?.nombre || "Usuario" }}</span>
              </q-item-section>
            </q-item>
            <q-item clickable @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <span>Cerrar sesión</span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-teal-dark text-white">
      <q-list>
        <q-item-label header class="text-white">
          Navegación
        </q-item-label>

        <!-- Mostrar solo las rutas disponibles según el rol -->
        <q-item v-for="route in userRoutes" :key="route.path" clickable tag="router-link" :to="route.path"
          :active-class="'active-link'" exact class="hover-bg-morado hover-text-white q-pa-xs">
          <q-item-section avatar>
            <q-icon :name="route.icon" class="text-white" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white">{{ route.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-banner class="bg-morado text-white q-mb-md">
        <div class="text-h6">{{ currentPageTitle }}</div>
      </q-banner>
      <!-- Contenido dinámico -->
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="bg-plomo text-white q-pa-md">
      <div class="text-center">
        © 2024 UNITEPC - Universidad Privada
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "MainLayout",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const leftDrawerOpen = ref(false);

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const routesByRole = {
      1: [
        { path: "/PaginaRegistroVector", label: "Registro de Vector", icon: "add_circle", title: "Registro de Vector" },
        { path: "/PaginaValidacionLaboratorio", label: "Validación de Laboratorio", icon: "science", title: "Validación de Laboratorio" },
        { path: "/PaginaRegistroUsuarios", label: "Registro de Usuarios", icon: "person_add", title: "Registro de Usuarios" },
        { path: "/PaginaRegistroDatos", label: "Registro de Datos", icon: "storage", title: "Registro de Datos" },
      ],
      2: [
        { path: "/PaginaRegistroDatos", label: "Registro de Datos", icon: "storage", title: "Registro de Datos" },
        { path: "/PaginaRegistroVector", label: "Registro de Vector", icon: "add_circle", title: "Registro de Vector" },
      ],
      3: [
        { path: "/PaginaRegistroDatos", label: "Registro de Datos", icon: "storage", title: "Registro de Datos" },
        { path: "/PaginaValidacionLaboratorio", label: "Validación de Laboratorio", icon: "science", title: "Validación de Laboratorio" },
      ],
    };

    const userRoutes = computed(() => {
      if (!currentUser || !currentUser.rol_id) {
        return [];
      }
      return routesByRole[currentUser.rol_id] || [];
    });

    const currentPageTitle = computed(() => {
      const currentRoute = userRoutes.value.find((r) => r.path === route.path);
      return currentRoute ? currentRoute.title : "Página no encontrada";
    });

    const logout = () => {
      localStorage.removeItem("user");
      router.push("/login");
    };

    return {
      currentUser,
      userRoutes,
      currentPageTitle,
      leftDrawerOpen,
      toggleLeftDrawer,
      logout,
    };
  },
};
</script>

<style>
.bg-morado {
  background-color: #6A1B9A;
}

.bg-plomo {
  background-color: #7f8181;
}

.bg-teal-dark {
  background-color: #009688;
}

.text-white {
  color: #FFFFFF;
}

.hover-bg-morado:hover {
  background-color: #6A1B9A;
}

.hover-text-white:hover {
  color: #FFFFFF;
}

.text-bold {
  font-weight: bold;
}

.active-link {
  background-color: #6A1B9A !important;
  color: #FFFFFF !important;
  border-radius: 8px;
}
</style>
