<script setup>
import RelacionPCService from '@/service/RelacionPCService';
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Variables y referencias
const toast = useToast();
const dt = ref(null);
const programas = ref([]);
const competencias = ref([]);
const relaciones = ref([]);
const programaSeleccionado = ref(null);
const competenciasSeleccionadas = ref([]);
const relacionDialog = ref(false);
const submitted = ref(false);
const selectedRelaciones = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
onMounted(async () => {
    try {
        const data = await RelacionPCService.getRelacion();
        console.log('lo que trae getRelacion', data);
        relaciones.value = data;
    } catch (error) {
        console.log('Error al cargar las relaciones:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos', life: 3000 });
    }
    try {
        const data = await RelacionPCService.getProgramas();
        programas.value = data;
    } catch (error) {
        console.error('Error al cargar la lista de programas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de programas', life: 3000 });
    }
    try {
        const data = await RelacionPCService.getCompetencias();
        competencias.value = data;
    } catch (error) {
        console.error('error al cargar las competencias:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se puso cargar la lista de competencias', life: 3000 });
    }
});

// Función para abrir el diálogo de creación de relación
function openNewRelacion() {
    programaSeleccionado.value = null;
    competenciasSeleccionadas.value = [];
    submitted.value = false;
    relacionDialog.value = true;
}

async function saveRelacion() {
    submitted.value = true;

    if (programaSeleccionado.value && competenciasSeleccionadas.value.length > 0) {
        const nuevaRelacion = {
            programaId: programaSeleccionado.value.ID,
            competenciaIds: competenciasSeleccionadas.value.map((competencia) => competencia.ID)
        };

        try {
            const saveRelacion = await RelacionPCService.saveRelacion(nuevaRelacion);
            relaciones.value.push(saveRelacion);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Relación creada', life: 3000 });

            const data = await RelacionPCService.getRelacion();
            relaciones.value = data;
            relacionDialog.value = false;
            programaSeleccionado.value = null;
            competenciasSeleccionadas.value = [];
        } catch (error) {
            console.error('Error al guardar la relación:', error, saveRelacion);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la relación', life: 3000 });
        }
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
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nueva Relación" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNewRelacion" />
                <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRelaciones || !selectedRelaciones.length" />
            </template>

            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="dt.value.exportCSV()" />
            </template>
        </Toolbar>

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
            <Column field="Nombre" header="Programa" sortable></Column>
            <Column field="competencia" header="Competencia">
                <template #body="slotProps">
                    <ul style="list-style-type: none; padding-left: 0">
                        <li v-for="competencia in slotProps.data.competencias" :key="competencia.ID">
                            {{ competencia.Nombre }}
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

        <Dialog v-model:visible="relacionDialog" :style="{ width: '600px' }" header="Detalles de la Relación" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="programa" class="block font-bold mb-3">Programa</label>
                    <Dropdown id="programa" v-model="programaSeleccionado" :options="programas" optionLabel="Nombre" placeholder="Seleccione un programa" style="width: 100%" />
                </div>

                <div>
                    <label for="competencias" class="block font-bold mb-3">Competencias</label>
                    <MultiSelect id="competencias" v-model="competenciasSeleccionadas" :options="competencias" optionLabel="Nombre" placeholder="Seleccione competencias" style="width: 100%" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="relacionDialog = false" />
                <Button label="Guardar" icon="pi pi-check" @click="saveRelacion" />
            </template>
        </Dialog>
    </div>
</template>
