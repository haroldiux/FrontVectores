<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card flat bordered class="card-login">
      <q-card-section class="text-center">
        <q-avatar size="80px" class="q-mb-md">
          <img src="public/icons/logoLogin.png" alt="Logo" />
        </q-avatar>
        <div class="text-h5 text-bold">Bienvenido a Vectores</div>
        <div class="text-subtitle2 text-grey">Inicia sesión para continuar</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input v-model="username" label="Nombre de usuario" filled dense outlined />
          <q-input v-model="password" :type="showPassword ? 'text' : 'password'" label="Contraseña" filled dense
            outlined>
            <template v-slot:append>
              <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="togglePasswordVisibility" />
            </template>
          </q-input>
          <q-btn type="submit" label="Iniciar sesión" color="primary" unelevated class="full-width" />
        </q-form>
      </q-card-section>

      <q-card-section align="center">
        <q-icon name="lock" size="20px" class="q-mr-xs" /> Tu información está segura
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { api } from 'boot/axios';

const username = ref('');
const password = ref('');
const showPassword = ref(false); // Controla la visibilidad de la contraseña
const router = useRouter();

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

async function handleLogin() {
  try {
    const response = await api.post('/login', {
      nombre: username.value,
      password: password.value,
    });

    const data = response.data;

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user)); // Guardar usuario en localStorage
      Notify.create({ type: 'positive', message: 'Inicio de sesión exitoso' });

      // Redirigir según el rol
      switch (data.user.rol_id) {
        case 1:
          router.push('/PaginaRegistroVector');
          break;
        case 2:
        case 3:
          router.push('/PaginaRegistroDatos');
          break;
        default:
          router.push('/');
      }
    } else {
      Notify.create({ type: 'negative', message: data.message || 'Credenciales incorrectas' });
    }
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error al iniciar sesión. Verifica tus datos.' });
  }
}
</script>

<style>
.bg-gradient {
  background: linear-gradient(135deg, #6A1B9A, #009688);
  min-height: 100vh;
}

.card-login {
  width: 400px;
  max-width: 90%;
  padding: 24px;
  border-radius: 12px;
  background: white;
}

.full-width {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
