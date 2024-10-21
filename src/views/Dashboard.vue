<template>
    <div class="card-container">
      <Card v-for="(archivo, index) in archivos" :key="index" style="width: 25rem; overflow: hidden; margin-right: 1rem;">
        <template #header>
          <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
        </template>
        <template #title>{{ archivo.nombre }}</template>
        <template #subtitle>Tamaño: {{ archivo.tamaño }} KB</template>
        <template #content>
          <p class="m-0">{{ archivo.descripcion }}</p>
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button 
              label="Ver" 
              class="w-full" 
              @click="verArchivo(archivo.url)" 
            />
            <Button 
              label="Descargar" 
              class="w-full" 
              @click="descargarArchivo(archivo.url, archivo.nombre)" 
            />
          </div>
        </template>
      </Card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Aquí almacenas la lista de archivos obtenidos de la base de datos
  const archivos = ref([
    { nombre: 'Documento1.pdf', tamaño: 1234, url: 'ruta/al/archivo/Documento1.pdf', descripcion: 'Descripción del Documento 1...' },
    { nombre: 'Documento2.pdf', tamaño: 5678, url: 'ruta/al/archivo/Documento2.pdf', descripcion: 'Descripción del Documento 2...' },
    { nombre: 'Documento3.pdf', tamaño: 5678, url: 'ruta/al/archivo/Documento3.pdf', descripcion: 'Descripción del Documento 3...' },
    // Añadir más documentos según sea necesario
  ]);
  
  // Función para ver el archivo (redirigir al enlace del archivo)
  const verArchivo = (url) => {
    window.open(url, '_blank');
  };
  
  // Función para descargar el archivo
  const descargarArchivo = (url, nombre) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre; // Nombre del archivo que se descargará
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  </script>
  
  <style scoped>
  .card-container {
    display: flex; /* Usar flexbox para alinear las tarjetas en línea */
    flex-wrap: wrap; /* Permitir que las tarjetas se ajusten en varias filas si es necesario */
    gap: 1rem; /* Espacio entre las tarjetas */
  }
  </style>
  