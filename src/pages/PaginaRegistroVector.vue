<template>
  <q-page padding>
    <q-form @submit.prevent="submitForm" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.usuarioNombre" label="Usuario" :disable="true" readonly outlined></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.fecha" label="Fecha" :disable="true" readonly outlined></q-input>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select v-model="form.especie" :options="especieOptions" label="Seleccionar Especie" emit-value
                map-options outlined></q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="form.vector" :options="vectorOptions" label="Seleccionar Vector" emit-value map-options
                outlined></q-select>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input v-model="form.descripcion" label="Descripción" type="textarea" filled outlined></q-input>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div id="map" style="height: 400px; margin-bottom: 20px"></div>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div>
                <label for="fileInput">Subir Foto</label>
                <input type="file" id="fileInput" ref="fileInput" class="dropify" />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Registrar" type="submit" color="primary"></q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { api } from "boot/axios";
import $ from "jquery";
import Swal from "sweetalert2";
import "dropify/dist/js/dropify.min";
import "dropify/dist/css/dropify.min.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      form: {
        usuario: "",
        usuarioNombre: "",
        vector: null,
        especie: null,
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        longitud: "",
        latitud: "",
      },
      vectorOptions: [],
      especieOptions: [],
      map: null,
      marker: null,
    };
  },
  mounted() {
    this.getUsuarioActual();

    this.getVectoresYEspecies();

    this.$nextTick(() => {
      $(this.$refs.fileInput).dropify();
    });

    this.initializeMapWithCurrentLocation();
  },
  methods: {
    async getUsuarioActual() {
      try {
        // Obtener el usuario desde localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          this.form.usuario = user.id; // ID del usuario
          this.form.usuarioNombre = user.nombre; // Nombre del usuario
        } else {
          console.error("No se encontró un usuario en sesión.");
        }
      } catch (error) {
        console.error("Error al obtener usuario actual", error);
      }
    },

    async getVectoresYEspecies() {
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
        console.error("Error al obtener vectores y especies", error);
      }
    },

    initializeMapWithCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            this.form.latitud = latitude.toFixed(12);
            this.form.longitud = longitude.toFixed(12);

            this.map = L.map("map").setView([latitude, longitude], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.map);

            this.marker = L.marker([latitude, longitude]).addTo(this.map);

            this.map.on("click", this.onMapClick);
          },
          (error) => {
            console.error("Error al obtener ubicación actual", error);
            Swal.fire({
              title: "Error",
              text: "No se pudo obtener la ubicación actual. Usa el mapa manualmente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });

            this.loadDefaultMap();
          }
        );
      } else {
        console.error("Geolocalización no soportada por el navegador");
        Swal.fire({
          title: "Error",
          text: "Geolocalización no soportada. Usa el mapa manualmente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });

        this.loadDefaultMap();
      }
    },
    loadDefaultMap() {
      const defaultLat = -17.987654321234;
      const defaultLng = -66.123456789123;

      this.form.latitud = defaultLat.toFixed(12);
      this.form.longitud = defaultLng.toFixed(12);

      this.map = L.map("map").setView([defaultLat, defaultLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.map.on("click", this.onMapClick);
    },
    onMapClick(event) {
      const { lat, lng } = event.latlng;
      this.form.latitud = lat.toFixed(12);
      this.form.longitud = lng.toFixed(12);

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("usuario_id", this.form.usuario);
        formData.append("vector_id", this.form.vector);
        formData.append("especie_id", this.form.especie);
        formData.append("descripcionRegistro", this.form.descripcion);
        formData.append("fecha", this.form.fecha);
        formData.append("longitud", this.form.longitud);
        formData.append("latitud", this.form.latitud);

        const file = this.$refs.fileInput.files[0];
        if (file) {
          formData.append("foto", file);
        }

        const response = await api.post("/registros", formData);

        Swal.fire({
          title: "Registro realizado con éxito",
          text: `Código asignado: ${response.data.codigo}`,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        this.resetForm();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error al registrar vector: ${error.response?.data?.message || error.message
            }`,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },
    resetForm() {
      this.form = {
        usuario: this.form.usuario,
        usuarioNombre: this.form.usuarioNombre,
        vector: null,
        especie: null,
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        longitud: "",
        latitud: "",
      };
      $(this.$refs.fileInput).val(null).trigger("change");

      if (this.marker) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }
    },
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
  max-width: 800px;
  margin: 0 auto;
}
</style>
