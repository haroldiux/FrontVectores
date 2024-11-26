<template>
  <q-page padding>
    <q-form @submit.prevent="submitForm" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="codigoBusqueda" label="Buscar Registro por Código" outlined></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-btn label="Buscar Vector" color="primary" @click="buscarRegistro" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select v-model="form.especie" :options="especieOptions" label="Especie" emit-value map-options readonly
                outlined></q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.descripcion" label="Descripción del Registro" readonly outlined />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <label>Foto registrada</label>
                  <div v-if="form.foto" class="text-center">
                    <img :src="`http://127.0.0.1:8000${form.foto}`" alt="Foto registrada" style="
                        max-width: 100%;
                        max-height: 300px;
                        margin-top: 10px;
                      " />
                  </div>
                  <div v-else class="text-center">
                    <p>No hay foto disponible</p>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div id="map" style="height: 400px; margin-bottom: 20px"></div>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.descripcionLaboratorio" label="Descripción del Laboratorio" outlined />
            </div>
            <div class="col-12 col-md-6">
              <div>
                <label>¿Tiene huevos?</label>
                <div style="display: flex; align-items: center">
                  <q-toggle v-model="form.tieneHuevos" />
                  <span style="margin-left: 10px">{{
                    form.tieneHuevos ? "Sí tiene" : "No tiene"
                    }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Actualizar" color="primary" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { api } from "boot/axios";
import L from "leaflet";
import Swal from "sweetalert2";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      form: {
        vector: "",
        especie: "",
        fecha: "",
        descripcion: "",
        descripcionLaboratorio: "",
        longitud: "",
        latitud: "",
        tieneHuevos: false,
        codigo: "",
        foto: "",
      },
      vectorOptions: [],
      especieOptions: [],
      codigoBusqueda: "",
      map: null,
      marker: null,
    };
  },
  methods: {
    async buscarRegistro() {
      if (!this.codigoBusqueda) {
        Swal.fire({
          title: "Error",
          text: "Por favor, introduce un código válido antes de buscar.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      try {
        const response = await api.get(
          `/registros/codigo/${this.codigoBusqueda}`
        );
        const registro = response.data;

        this.form.vector = registro.vector_id || "";
        this.form.especie = registro.especie_id || "";
        this.form.fecha = registro.fecha || "";
        this.form.descripcion = registro.descripcionRegistro || "";
        this.form.descripcionLaboratorio =
          registro.descripcionLaboratorio || "";
        this.form.longitud = registro.longitud || "";
        this.form.latitud = registro.latitud || "";
        this.form.tieneHuevos =
          registro.resultado !== null ? registro.resultado : false; // Establece false si es null
        this.form.codigo = registro.codigo || "";
        this.form.foto = registro.foto || "";

        if (this.map) {
          this.map.remove();
        }

        this.map = L.map("map").setView(
          [registro.latitud, registro.longitud],
          13
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);

        L.marker([registro.latitud, registro.longitud]).addTo(this.map);

        Swal.fire({
          title: "Éxito",
          text: "Datos cargados correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } catch (error) {
        console.error("Error al buscar registro", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar el registro seleccionado.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },

    async cargarOpciones() {
      try {
        const response = await api.get("/especies");
        const especies = response.data.especies;

        this.vectorOptions = especies.map((especie) => ({
          label: especie.vector.nombre,
          value: especie.vector.id,
        }));

        this.especieOptions = especies.map((especie) => ({
          label: especie.nombre,
          value: especie.id,
        }));
      } catch (error) {
        console.error(
          "Error al cargar opciones de vectores y especies:",
          error
        );
      }
    },

    initializeMap() {
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map("map").setView([-17.987654, -66.123456], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    },

    async submitForm() {
      if (!this.form.codigo) {
        Swal.fire({
          title: "Error",
          text: "No se puede actualizar el registro sin un código válido.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      try {
        const formData = {
          descripcionLaboratorio: this.form.descripcionLaboratorio,
          resultado: this.form.tieneHuevos ? true : false,
        };

        const response = await api.put(
          `/registros/codigo/${this.form.codigo}`,
          formData
        );

        Swal.fire({
          title: "Actualización Exitosa",
          text: response.data.message || "Registro actualizado correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        this.resetForm();
      } catch (error) {
        console.error("Error al actualizar el registro:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el registro.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },
    resetForm() {
      this.codigoBusqueda = "";
      this.form = {
        usuario: this.form.usuario, // Mantén el usuario actual
        usuarioNombre: this.form.usuarioNombre, // Mantén el nombre del usuario
        vector: null,
        especie: null,
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        longitud: "",
        latitud: "",
        foto: "", // Limpia la referencia a la foto
        descripcionLaboratorio: "",
        tieneHuevos: false,
        codigo: "",
      };

      if (this.map && this.marker) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }
    },
  },
  mounted() {
    this.cargarOpciones();
    this.initializeMap();
  },
};
</script>

<style scoped>
#map {
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
}

.q-gutter-md {
  gap: 16px;
}

.q-card {
  min-width: 800px;
  margin: 0 auto;
}
</style>
