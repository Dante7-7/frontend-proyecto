<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import UsuarioService from '@/service/UsuarioService';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const email = ref('');
const submitted = ref(false);
const toast = useToast();

async function onSubmit() {
    submitted.value = true;

    try {
        const response = await UsuarioService.recuperar_clave(email.value);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.data.message,
            life: 3000
        });
    } catch (error) {
        console.error(error);
    } finally {
        submitted.value = false;
    }
}

function redirectToLogin() {
    router.push('/auth/login');
}
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <h2 class="text-center text-2xl font-bold mb-4">Recuperar Contraseña</h2>
                    <form @submit.prevent="onSubmit">
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <InputText id="email" type="text" placeholder="Correo electrónico" class="w-full md:w-[25rem] mb-8" v-model="email" />
                        </div>
                        <Button type="submit" label="Enviar" class="w-full"></Button>
                    </form>
                    <p class="mt-4 text-center">
                        <a @click="redirectToLogin" class="font-medium ml-2 text-right cursor-pointer text-primary">Volver al inicio de sesión</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <Toast />
    <router-view />
</template>

<style scoped>
/* Estilos opcionales */
</style>
