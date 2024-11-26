<template>
  <q-page padding>
    <q-form @submit.prevent="submitForm" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <h2 class="titulo-formulario">Completa tu Información Personal</h2>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-12">
              <q-input v-model="form.usuarioNombre" label="Usuario" :disable="true" readonly outlined></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.nombres" label="Nombres" outlined required></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.apellidos" label="Apellidos" outlined required></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.telefono" label="Teléfono" type="tel" outlined required></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.ci" label="CI (Carnet de Identidad)" type="text" outlined required></q-input>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Guardar Información" type="submit" color="primary" class="full-width"></q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { api } from "boot/axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      form: {
        id: null, // ID del usuario autenticado
        usuarioNombre: "", // Nombre del usuario autenticado
        nombres: "",
        apellidos: "",
        telefono: "",
        ci: "",
      },
    };
  },
  mounted() {
    this.getUsuarioActual();
  },
  methods: {
    // Obtener datos del usuario actual desde localStorage y cargarlos
    async getUsuarioActual() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user")); // Leer usuario desde localStorage
        if (!storedUser || !storedUser.id) {
          throw new Error("No se pudo encontrar el usuario actual.");
        }

        // Asignar datos básicos del usuario
        this.form.id = storedUser.id;
        this.form.usuarioNombre = storedUser.nombre;

        // Obtener datos detallados del usuario desde el backend
        const response = await api.get(`/usuarios/${storedUser.id}`);
        const usuario = response.data;

        // Rellenar los campos del formulario con los datos obtenidos
        this.form.nombres = usuario.nombres || "";
        this.form.apellidos = usuario.apellidos || "";
        this.form.telefono = usuario.telefono || "";
        this.form.ci = usuario.ci || "";
      } catch (error) {
        console.error("Error al obtener el usuario actual:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la información del usuario actual.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },

    async editarUsuario() {
      try {
        // Verificar que el id del usuario esté presente
        if (!this.form.id) {
          throw new Error("No se pudo encontrar el ID del usuario.");
        }

        // Realizar la solicitud GET al backend para obtener los datos del usuario
        const response = await api.get(`/usuarios/${this.form.id}`);
        const usuario = response.data;

        // Llenar los campos del formulario con los datos del usuario
        this.form.nombres = usuario.nombres || "";
        this.form.apellidos = usuario.apellidos || "";
        this.form.telefono = usuario.telefono || "";
        this.form.ci = usuario.ci || "";
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        Swal.fire({
          title: "Error",
          text: `Error al obtener los datos del usuario: ${error.response?.data?.message || error.message}`,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },

    async submitForm() {
      try {
        // Verificar que el id del usuario esté presente
        if (!this.form.id) {
          throw new Error("No se pudo encontrar el ID del usuario.");
        }

        // Preparar los datos del formulario para enviar
        const formData = {
          id: this.form.id, // Incluye el ID aquí
          nombres: this.form.nombres,
          apellidos: this.form.apellidos,
          telefono: this.form.telefono,
          ci: this.form.ci,
        };

        // Realizar la solicitud PUT al backend
        const response = await api.put(`/usuarios/${this.form.id}`, formData); // El ID también está en la URL

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "Actualización Exitosa",
          text: response.data.message || "Usuario actualizado correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);

        Swal.fire({
          title: "Error",
          text: `Error al actualizar el usuario: ${error.response?.data?.message || error.message}`,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
  },
};
</script>

<style scoped>
.titulo-formulario {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.q-card {
  max-width: 600px;
  margin: 0 auto;
}

.q-btn.full-width {
  width: 100%;
}
</style>
