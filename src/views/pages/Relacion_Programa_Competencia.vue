<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import InputText from 'primevue/inputtext';
import { FilterMatchMode } from '@primevue/core/api';

// Variables y referencias
const toast = useToast();
const dt = ref(null);
const programas = ref([
    { id: 1, nombre: 'Programa A' },
    { id: 2, nombre: 'Programa B' },
    { id: 3, nombre: 'Programa C' },
]);
const competencias = ref([
    { id: 1, nombre: 'Competencia 1' },
    { id: 2, nombre: 'Competencia 2' },
    { id: 3, nombre: 'Competencia 3' },
]);
const relaciones = ref([]);
const programaSeleccionado = ref(null);
const competenciasSeleccionadas = ref([]);
const relacionDialog = ref(false);
const submitted = ref(false);
const selectedRelaciones = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Función para abrir el diálogo de creación de relación
function openNewRelacion() {
    programaSeleccionado.value = null;
    competenciasSeleccionadas.value = [];
    submitted.value = false;
    relacionDialog.value = true;
}

// Función para guardar la relación
function saveRelacion() {
    submitted.value = true;

    if (programaSeleccionado.value && competenciasSeleccionadas.value.length > 0) {
        const nuevaRelacion = {
            id: relaciones.value.length + 1,
            programa: programaSeleccionado.value,
            competencias: competenciasSeleccionadas.value,
        };
        relaciones.value.push(nuevaRelacion);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Relación creada', life: 3000 });

        // Cerrar el diálogo y reiniciar el formulario
        relacionDialog.value = false;
        programaSeleccionado.value = null;
        competenciasSeleccionadas.value = [];
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un programa y al menos una competencia', life: 3000 });
    }
}

// Función para eliminar una relación
function deleteRelacion(index) {
    relaciones.value.splice(index, 1);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Relación eliminada', life: 3000 });
}

function confirmDeleteSelected() {
    relaciones.value = relaciones.value.filter((val) => !selectedRelaciones.value.includes(val));
    selectedRelaciones.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Relaciones eliminadas', life: 3000 });
}
</script>

<template>
    <div class="card">
        <!-- Barra de herramientas -->
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nueva Relación" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNewRelacion" />
                <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRelaciones || !selectedRelaciones.length" />
            </template>

            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="dt.value.exportCSV()" />
            </template>
        </Toolbar>

        <!-- Tabla de relaciones -->
        <DataTable
            ref="dt"
            v-model:selection="selectedRelaciones"
            :value="relaciones"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} relaciones"
            responsiveLayout="scroll"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Administrar Relaciones de Programas y Competencias</h4>
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="programa.nombre" header="Programa" sortable></Column>
            <Column field="competencias" header="Competencias">
                <template #body="slotProps">
                    <ul>
                        <li v-for="competencia in slotProps.data.competencias" :key="competencia.id">
                            {{ competencia.nombre }}
                        </li>
                    </ul>
                </template>
            </Column>
            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteRelacion(slotProps.rowIndex)" />
                </template>
            </Column>
        </DataTable>

        <!-- Dialogo para crear relaciones -->
        <Dialog v-model:visible="relacionDialog" :style="{ width: '600px' }" header="Detalles de la Relación" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="programa" class="block font-bold mb-3">Programa</label>
                    <Dropdown id="programa" v-model="programaSeleccionado" :options="programas" optionLabel="nombre" placeholder="Seleccione un programa" style="width: 100%;" />
                </div>

                <div>
                    <label for="competencias" class="block font-bold mb-3">Competencias</label>
                    <MultiSelect id="competencias" v-model="competenciasSeleccionadas" :options="competencias" optionLabel="nombre" placeholder="Seleccione competencias" style="width: 100%;" />
                </div>

                <!-- Tabla de competencias seleccionadas -->
                <div>
                    <h5>Competencias Seleccionadas</h5>
                    <DataTable :value="competenciasSeleccionadas" responsiveLayout="scroll">
                        <Column field="nombre" header="Nombre de la Competencia"></Column>
                    </DataTable>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="relacionDialog = false" />
                <Button label="Guardar" icon="pi pi-check" @click="saveRelacion" />
            </template>
        </Dialog>
    </div>
</template>
