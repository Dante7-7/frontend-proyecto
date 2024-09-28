<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const archivos = ref([]);
const archivoDialog = ref(false);
const deleteArchivoDialog = ref(false);
const deleteArchivosDialog = ref(false);
const archivo = ref({});
const selectedArchivos = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener los archivos de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga los archivos
    // Por ejemplo: ArchivoService.getArchivos().then(data => (archivos.value = data));
});

// Funciones para el manejo de archivos
function openNew() {
    archivo.value = {};
    submitted.value = false;
    archivoDialog.value = true;
}

function hideDialog() {
    archivoDialog.value = false;
    submitted.value = false;
}

function saveArchivo() {
    submitted.value = true;

    if (archivo?.value.Nombre?.trim()) {
        if (archivo.value.id) {
            archivos.value[findIndexById(archivo.value.id)] = archivo.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo actualizado', life: 3000 });
        } else {
            archivo.value.id = createId();
            archivos.value.push(archivo.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo creado', life: 3000 });
        }

        archivoDialog.value = false;
        archivo.value = {};
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

function deleteArchivo() {
    archivos.value = archivos.value.filter((val) => val.id !== archivo.value.id);
    deleteArchivoDialog.value = false;
    archivo.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo eliminado', life: 3000 });
}

function findIndexById(id) {
    return archivos.value.findIndex((a) => a.id === id);
}

function createId() {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteArchivosDialog.value = true;
}

function deleteSelectedArchivos() {
    archivos.value = archivos.value.filter((val) => !selectedArchivos.value.includes(val));
    deleteArchivosDialog.value = false;
    selectedArchivos.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivos eliminados', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Archivo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedArchivos || !selectedArchivos.length" />
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

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Fecha_Creacion" header="Fecha de Creación" sortable style="min-width: 20rem"></Column>
                <Column field="Tamaño" header="Tamaño" sortable style="min-width: 12rem"></Column>
                <Column field="Link" header="Enlace" sortable style="min-width: 16rem"></Column>
                <Column field="id_resultado" header="ID Resultado" sortable style="min-width: 12rem"></Column>
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
                    <label for="Fecha_Creacion" class="block font-bold mb-3">Fecha de Creación</label>
                    <InputText id="Fecha_Creacion" v-model="archivo.Fecha_Creacion" required="true" type="date" />
                </div>

                <div>
                    <label for="Tamaño" class="block font-bold mb-3">Tamaño</label>
                    <InputText id="Tamaño" v-model="archivo.Tamaño" required="true" fluid />
                </div>

                <div>
                    <label for="Link" class="block font-bold mb-3">Enlace del Archivo</label>
                    <InputText id="Link" v-model="archivo.Link" required="true" fluid />
                </div>

                <div>
                    <label for="id_resultado" class="block font-bold mb-3">ID Resultado</label>
                    <InputText id="id_resultado" v-model="archivo.id_resultado" required="true" type="number" />
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
                <span v-if="archivo">¿Seguro que deseas eliminar <b>{{ archivo.Nombre }}</b>?</span>
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
