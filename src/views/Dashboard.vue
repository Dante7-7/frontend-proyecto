<script setup>
import ArchivoService from '@/service/ArchivoService';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { computed, onMounted, ref } from 'vue';

const archivos = ref([]);
const isLoading = ref(false);
const usuarioId = localStorage.getItem('usuarioId');
const searchQuery = ref('');
console.log('usuario id', usuarioId);

onMounted(async () => {
    try {
        const data = await ArchivoService.getArchivos(usuarioId);
        archivos.value = data;
        console.log('lo que llega al front', data);
    } catch (error) {
        console.error('Error al obtener archivos:', error);
    }
});

const filteredArchivos = computed(() => {
    const query = searchQuery.value.toLocaleLowerCase();
    return archivos.value.filter((archivoData) => {
        return archivoData.archivo.Nombre.toLocaleLowerCase().includes(query) || archivoData.resultado.Nombre.toLocaleLowerCase().includes(query);
    });
});
// Función para ver el archivo (redirigir al enlace del archivo)
const verArchivo = (url) => {
    window.open(url, '_blank');
};

// Función para descargar el archivo
const descargarArchivo = async (url, nombre) => {
    console.log('Iniciando descarga:', url);
    isLoading.value = true;

    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;

    fetch(url)
        .then((response) => {
            if (response.ok) {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('Error al acceder a la URL:', response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error al descargar el archivo:', error);
        });

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera de 1 segundo
    isLoading.value = false;
};
</script>

<template>
    <div>
        <InputText v-model="searchQuery" placeholder="Buscar archivo..." class="mb-4" />
    </div>
    <div class="card-container">
        <template v-if="filteredArchivos.length === 0">
            <p>No hay guías creadas o asignadas.</p>
        </template>
        <Card v-for="(archivoData, index) in filteredArchivos" :key="index" style="width: 25rem; overflow: hidden; margin-right: 1rem">
            <template #header>
                <img alt="user header" src="https://www.consumoteca.com/wp-content/uploads/PDF-icon-jpg.webp" />
            </template>
            <template #title>{{ archivoData.archivo.Nombre }}</template>
            <template #subtitle>Tamaño: {{ archivoData.archivo.Tamaño }} KB</template>
            <template #content>
                <p class="m-0">Resultado de aprendizaje {{ archivoData.resultado.Nombre }}</p>
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
