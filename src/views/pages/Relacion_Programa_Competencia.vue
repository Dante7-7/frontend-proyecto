<script setup>
import RelacionPCService from '@/service/RelacionPCService';
import { FilterMatchMode } from '@primevue/core/api';
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
const deleteRelacionDialog = ref(false);
const submitted = ref(false);
const selectedRelaciones = ref([]);
const relacionAEliminar = ref(null);
const competenciaSeleccionadaEliminar = ref(null);
const competenciasRelacionadas = ref([]);
const deleteRelacionEspecificaDialog = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
onMounted(async () => {
    try {
        const data = await RelacionPCService.getRelacion();
        relaciones.value = data;
    } catch (error) {
        console.log('Error al cargar las relaciones:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos', life: 3000 });
    }
    try {
        const data = await RelacionPCService.getRelacion();
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

async function refreshArchivos() {
    const data = await RelacionPCService.getRelacion();
    relaciones.value = data;
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

            await refreshArchivos();

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

function confirmDeleteRelacion(relacion) {
    deleteRelacionDialog.value = true;
    relacionAEliminar.value = relacion;
    console.log('Relación a eliminar:', relacion);
}
function confirmDeleteRelacionEspecifica(relacion) {
    deleteRelacionEspecificaDialog.value = true;
    relacionAEliminar.value = relacion;
    competenciasRelacionadas.value = relacion.competencias || [];
    competenciaSeleccionadaEliminar.value = null; // Reinicia la selección
}

// Función para eliminar una relación específica
async function deleteRelacion() {
    if (!relacionAEliminar.value || !relacionAEliminar.value.ID) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se encontró la relación a eliminar', life: 3000 });
        return;
    }
    const { ID: programaId } = relacionAEliminar.value;
    const competenciasRelacionadas = relaciones.value.find((rel) => rel.ID === programaId)?.competencias || [];
    if (competenciasRelacionadas.length === 0) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'No hay relaciones que eliminar', life: 3000 });
        deleteRelacionDialog.value = false; // Cierra el diálogo de eliminación
        return;
    }

    const relacion = { programaId: relacionAEliminar.value.ID };
    console.log(relacion);

    try {
        await RelacionPCService.delete(relacion);

        // Filtra la relación eliminada del array
        relaciones.value = relaciones.value.filter((rel) => rel.ID !== relacion.ID);

        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Relación eliminada', life: 3000 });
        await refreshArchivos();
        deleteRelacionDialog.value = false;
        relacionAEliminar.value = null;
    } catch (error) {
        console.error('Error al eliminar la relación:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la relación', life: 3000 });
    }
}

async function deleteRelacionEspecifica() {
    if (!relacionAEliminar.value || !competenciaSeleccionadaEliminar.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una competencia para eliminar', life: 3000 });
        return;
    }

    const { ID: programaId } = relacionAEliminar.value;
    const { ID: competenciaId } = competenciaSeleccionadaEliminar.value;

    try {
        await RelacionPCService.deleteRelacionEspecifica({ programaId, competenciaId });
        await refreshArchivos();
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencia eliminada de la relación', life: 3000 });
        deleteRelacionEspecificaDialog.value = false;
        relacionAEliminar.value = null;
        competenciaSeleccionadaEliminar.value = null;
    } catch (error) {
        console.error('Error al eliminar la relación:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la competencia', life: 3000 });
    }
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nueva Relación" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNewRelacion" />
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
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteRelacion(slotProps.data)" />
                    <Button icon="pi pi-pencil" outlined rounded @click="confirmDeleteRelacionEspecifica(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <!-- dialog para confirmar eliminacion -->
        <Dialog v-model:visible="deleteRelacionDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>¿Seguro que deseas eliminar TODAS las relaciones?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteRelacionDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteRelacion" />
            </template>
        </Dialog>

        <!--dialog para editar relaciones-->
        <Dialog v-model:visible="deleteRelacionEspecificaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="competenciasEliminar" class="block font-bold mb-3">Competencias Relacionadas</label>
                    <Dropdown id="competenciasEliminar" v-model="competenciaSeleccionadaEliminar" :options="competenciasRelacionadas" optionLabel="Nombre" placeholder="Seleccione una competencia" style="width: 100%" />
                </div>
                <div class="flex items-center gap-4">
                    <i class="pi pi-exclamation-triangle !text-3xl" />
                    <span>¿Seguro que deseas eliminar la relación seleccionada?</span>
                </div>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteRelacionEspecificaDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteRelacionEspecifica" />
            </template>
        </Dialog>

        <!--dialog para crear relaciones-->
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
