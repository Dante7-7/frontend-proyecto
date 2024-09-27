<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const guides = ref([]);
const guideDialog = ref(false);
const deleteGuideDialog = ref(false);
const deleteGuidesDialog = ref(false);
const guide = ref({});
const selectedGuides = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener las guías de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga las guías
    // Por ejemplo: GuideService.getGuides().then(data => (guides.value = data));
});

// Funciones para el manejo de guías
function openNew() {
    guide.value = {};
    submitted.value = false;
    guideDialog.value = true;
}

function hideDialog() {
    guideDialog.value = false;
    submitted.value = false;
}

function saveGuide() {
    submitted.value = true;

    if (guide?.value.title?.trim()) {
        if (guide.value.id) {
            guides.value[findIndexById(guide.value.id)] = guide.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guía actualizada', life: 3000 });
        } else {
            guide.value.id = createId();
            guides.value.push(guide.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guía creada', life: 3000 });
        }

        guideDialog.value = false;
        guide.value = {};
    }
}

function editGuide(g) {
    guide.value = { ...g };
    guideDialog.value = true;
}

function confirmDeleteGuide(g) {
    guide.value = g;
    deleteGuideDialog.value = true;
}

function deleteGuide() {
    guides.value = guides.value.filter((val) => val.id !== guide.value.id);
    deleteGuideDialog.value = false;
    guide.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guía eliminada', life: 3000 });
}

function findIndexById(id) {
    return guides.value.findIndex((g) => g.id === id);
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
    deleteGuidesDialog.value = true;
}

function deleteSelectedGuides() {
    guides.value = guides.value.filter((val) => !selectedGuides.value.includes(val));
    deleteGuidesDialog.value = false;
    selectedGuides.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Guías eliminadas', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva Guía" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedGuides || !selectedGuides.length" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedGuides"
                :value="guides"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} guías"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Guías</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="code" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="title" header="Título" sortable style="min-width: 16rem"></Column>
                <Column field="creationDate" header="Fecha de Creación" sortable style="min-width: 12rem"></Column>
                <Column field="description" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editGuide(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteGuide(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar guía -->
        <Dialog v-model:visible="guideDialog" :style="{ width: '450px' }" header="Detalles de la Guía" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="title" class="block font-bold mb-3">Título</label>
                    <InputText id="title" v-model.trim="guide.title" required="true" autofocus :invalid="submitted && !guide.title" fluid />
                    <small v-if="submitted && !guide.title" class="text-red-500">El título es obligatorio.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="description" v-model="guide.description" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="creationDate" class="block font-bold mb-3">Fecha de Creación</label>
                    <InputText id="creationDate" v-model="guide.creationDate" required="true" placeholder="yyyy-mm-dd" />
                </div>

                <div>
                    <label for="code" class="block font-bold mb-3">Código de la Guía</label>
                    <InputText id="code" v-model="guide.code" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveGuide" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteGuideDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="guide">¿Seguro que deseas eliminar <b>{{ guide.title }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteGuideDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteGuide" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteGuidesDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="guide">¿Seguro que deseas eliminar las guías seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteGuidesDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedGuides" />
            </template>
        </Dialog>
    </div>
</template>
