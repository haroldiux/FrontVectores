<template>
  <q-page padding>
    <q-form @submit.prevent="submitForm" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="col-12 text-center">
            <h2 class="titulo-formulario">Creación Masiva de Usuarios</h2>
            <div class="row q-col-gutter-md justify-center">
              <img src="/icons/registrosmasivos.png" alt="Registros Masivos"
                style="max-width: 150px; margin-bottom: 20px" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select v-model="form.rol" :options="rolOptions" label="Seleccionar Rol" emit-value map-options
                outlined></q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="form.numUsuarios" label="Cantidad de Usuarios" type="number" outlined></q-input>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Crear Usuarios" type="submit" color="primary" class="full-width"></q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { api } from "boot/axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data() {
    return {
      form: {
        rol: null,
        numUsuarios: null,
      },
      rolOptions: [
        { label: "Registrador", value: 2 },
        { label: "Laboratorio", value: 3 },
      ],
    };
  },
  methods: {
    async submitForm() {
      if (!this.form.rol || !this.form.numUsuarios) {
        Swal.fire({
          title: "Error",
          text: "Por favor, selecciona un rol y una cantidad de usuarios.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      try {
        // Realizar la solicitud POST al backend
        const response = await api.post("/usuarios", {
          rol: this.form.rol,
          numUsuarios: this.form.numUsuarios,
        });

        Swal.fire({
          title: "Éxito",
          text: response.data.message || "Usuarios registrados correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        // Generar el PDF con los usuarios y contraseñas devueltos por el backend
        this.generatePDF(response.data.usuarios);

        // Reiniciar el formulario
        this.form.rol = null;
        this.form.numUsuarios = null;
      } catch (error) {
        Swal.fire({
          title: "Error",
          text:
            error.response?.data?.message || "No se pudo crear los usuarios.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },

    generatePDF(usuarios) {
      const doc = new jsPDF();

      // Título del documento
      doc.setFontSize(18);
      doc.text("Reporte de Usuarios Registrados", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`, 14, 28);

      // Configuración de tabla
      autoTable(doc, {
        startY: 40,
        head: [["Nombre de Usuario", "Contraseña"]],
        body: usuarios.map((usuario) => [usuario.nombre, usuario.password]),
        styles: {
          fontSize: 10,
          cellPadding: 5,
          valign: "middle",
          halign: "center",
        },
        headStyles: {
          fillColor: [22, 160, 133], // Un verde suave para los encabezados
          textColor: [255, 255, 255], // Blanco para el texto del encabezado
          fontSize: 12,
        },
        alternateRowStyles: {
          fillColor: [230, 240, 248], // Color suave para las filas alternadas
        },
      });

      // Guardar el PDF
      doc.save("usuarios_registrados.pdf");
    },
  },
};
</script>
<style scoped>
.q-gutter-md {
  gap: 16px;
}

.q-card {
  max-width: 600px;
  margin: 0 auto;
}

.q-btn.full-width {
  width: 100%;
}

.q-card-section h2.titulo-formulario {
  margin-top: 10px;
  font-weight: bold;
  text-align: left;
  /* Cambié de center a left */
  font-size: 1.8em;
  /* Aumenté un poco el tamaño de la fuente */
  width: 100%;
  /* Abarca todo el ancho */
}
</style>
