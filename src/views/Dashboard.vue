<script setup>
import ArchivoService from '@/service/ArchivoService';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { onMounted, ref } from 'vue';

const archivos = ref([]);
const isLoading = ref(false);

onMounted(async () => {
    try {
        const data = await ArchivoService.getArchivos();
        archivos.value = data;
    } catch (error) {
        console.error('Error al obtener archivos:', error);
    }
});

// Función para ver el archivo (redirigir al enlace del archivo)
const verArchivo = (url) => {
    window.open(url, '_blank');
};

// Función para descargar el archivo
const descargarArchivo = async (url, nombre) => {
    isLoading.value = true; // Iniciar carga
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Simulando una espera para que el usuario pueda ver el mensaje
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera de 1 segundo
    isLoading.value = false; // Finalizar carga
};
</script>

<template>
    <div class="card-container">
        <template v-if="archivos.length === 0">
            <p>No hay guías creadas.</p>
        </template>
        <Card v-for="(archivo, index) in archivos" :key="index" style="width: 25rem; overflow: hidden; margin-right: 1rem">
            <template #header>
                <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
            </template>
            <template #title>{{ archivo.Nombre }}</template>
            <template #subtitle>Tamaño: {{ archivo.Tamaño }} KB</template>
            <template #content>
                <p class="m-0">{{ archivo.resultado.Nombre }}</p>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button label="Ver" class="w-full" @click="verArchivo(archivo.Link)" />
                    <Button label="Descargar" class="w-full" @click="descargarArchivo(archivo.Link, archivo.Nombre)" />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
