<script setup>
import ArchivoService from '@/service/ArchivoService';
import { FilterMatchMode } from '@primevue/core/api';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const archivos = ref([]);
const archivoDialog = ref(false);
const deleteArchivoDialog = ref(false);
const deleteArchivosDialog = ref(false);
const archivo = ref({});
const archivoFile = ref(null); // Nueva referencia para el archivo seleccionado
const selectedArchivos = ref();
const resultados = ref([]);
//const usuarioId = localStorage.getItem('usuarioId');
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const data = await ArchivoService.getAllArchivos();
        archivos.value = data;
        console.log('archivos', archivos);
    } catch (error) {
        console.error('Error al cargar archivos:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las guias', life: 3000 });
    }
    try {
        const data = await ArchivoService.getResultados();
        resultados.value = data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los resultados', life: 3000 });
    }
});

// Función para manejar la selección del archivo
function onFileSelected(event) {
    archivoFile.value = event.target.files[0];
}
function openNew() {
    archivo.value = {};
    submitted.value = false;
    archivoDialog.value = true;
}

function hideDialog() {
    archivoDialog.value = false;
    submitted.value = false;
}
async function refreshArchivos() {
    const data = await ArchivoService.getAllArchivos();
    archivos.value = data;
}

async function saveArchivo() {
    submitted.value = true;

    try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', archivoFile.value);
        const uploadResponse = await ArchivoService.uploadArchivo(formDataUpload);
        const fileUrl = uploadResponse.data.url;
        const public_id = uploadResponse.data.public_id;

        // Crear el objeto de datos para el servidor
        const registroData = {
            Codigo: archivo.value.Codigo,
            Nombre: archivo.value.Nombre,
            Tamaño: String(archivoFile.value.size),
            id_resultado: Number(archivo.value.id_resultado),
            Link: fileUrl,
            public_id: public_id
        };

        const archivoExistente = archivos.value.some((p) => p.Codigo === archivo.value.Codigo);

        if (archivoExistente) {
            await ArchivoService.updateArchivo(archivo.value.Codigo, registroData);
            const index = findIndexById(archivo.value.Codigo);
            if (index !== -1) {
                Object.assign(archivos.value[index], registroData);
            }
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guía actualizada', life: 3000 });
        } else {
            const { data } = await ArchivoService.saveArchivo(registroData);
            archivos.value.push(data);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guía creada', life: 3000 });
        }
        archivoDialog.value = false;
        archivo.value = {};
        archivoFile.value = null;
    } catch (error) {
        console.error('Error al guardar la guía:', error);
        const errorMessage = error.response?.data?.message || 'No se pudo guardar la guía'; // Obtener un mensaje de error específico si existe
        toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
    } finally {
        await refreshArchivos(); // Refrescar archivos solo si hubo éxito
    }
}

function editArchivo(a) {
    archivo.value = { ...a };
    archivoDialog.value = true;
}

function confirmDeleteArchivo(a) {
    archivo.value = a;
    deleteArchivoDialog.value = true;
}

async function deleteArchivo() {
    try {
        await ArchivoService.deleteArchivo(archivo.value.Codigo);
        archivos.value = archivos.value.filter((val) => val.Codigo !== archivo.value.Codigo);
        deleteArchivoDialog.value = false;
        archivo.value = {};
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'archivo eliminado', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la guia', life: 3000 });
    }
}

function findIndexById(Codigo) {
    return archivos.value.findIndex((a) => a.Codigo === Codigo);
}

// function createId() {
//     let id = '';
//     var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (var i = 0; i < 5; i++) {
//         id += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return id;
// }

function exportCSV() {
    dt.value.exportCSV();
}

async function deleteSelectedArchivos() {
    try {
        const deletePromises = selectedArchivos.value.map((archivo) => ArchivoService.deleteResultado(archivo.id));
        await Promise.all(deletePromises);
        archivos.value = archivos.value.filter((val) => !selectedArchivos.value.includes(val));
        deleteArchivoDialog.value = false;
        selectedArchivos.value = null;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'guias eliminadas', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar los programas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar las guias', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Archivo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedArchivos"
                :value="archivos"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} archivos"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Archivos</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="resultado.Nombre" header="Resultado" sortable style="min-width: 12rem"></Column>
                <Column field="Tamaño" header="Tamaño" sortable style="min-width: 12rem"></Column>
                <Column field="Link" header="Enlace" sortable style="min-width: 16rem"></Column>

                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editArchivo(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteArchivo(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar archivo -->
        <Dialog v-model:visible="archivoDialog" :style="{ width: '450px' }" header="Detalles del Archivo" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="Nombre" v-model.trim="archivo.Nombre" required="true" autofocus :invalid="submitted && !archivo.Nombre" fluid />
                    <small v-if="submitted && !archivo.Nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="file" class="block font-bold mb-3">Seleccionar archivo</label>
                    <input type="file" id="file" @change="onFileSelected" enctype="multipart/form-data" />
                    <small v-if="submitted && !archivoFile" class="text-red-500">El archivo es obligatorio.</small>
                </div>

                <div>
                    <label for="id_resultado" class="block font-bold mb-3">Resultado</label>
                    <Select id="id_resultado" v-model="archivo.id_resultado" :options="resultados" optionLabel="Nombre" optionValue="ID" placeholder="Selecciona un resultado" required />
                    <small v-if="submitted && !archivo.id_resultado" class="text-red-500">El resultado es obligatorio.</small>
                </div>

                <div>
                    <label for="Codigo" class="block font-bold mb-3">Código del Archivo</label>
                    <InputText id="Codigo" v-model="archivo.Codigo" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveArchivo" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteArchivoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="archivo"
                    >¿Seguro que deseas eliminar <b>{{ archivo.Nombre }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteArchivoDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteArchivo" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteArchivosDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="archivo">¿Seguro que deseas eliminar los archivos seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteArchivosDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedArchivos" />
            </template>
        </Dialog>
    </div>
</template>
