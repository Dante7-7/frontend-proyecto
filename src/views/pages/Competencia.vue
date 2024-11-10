<script setup>
import CompetenciaService from '@/service/CompetenciaService'; // Cambiar a tu servicio de competencias
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const competencias = ref([]);
const competenciaDialog = ref(false);
const deleteCompetenciaDialog = ref(false);
const deleteCompetenciasDialog = ref(false);
const competencia = ref({});
const selectedCompetencias = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const data = await CompetenciaService.getCompetencias();
        competencias.value = data;
    } catch (error) {
        console.error('Error al cargar las competencias:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las competencias', life: 3000 });
    }
});

// Funciones para el manejo de competencias
function openNew() {
    competencia.value = {};
    submitted.value = false;
    competenciaDialog.value = true;
}

function hideDialog() {
    competenciaDialog.value = false;
    submitted.value = false;
}

async function saveCompetencia() {
    submitted.value = true;

    if (competencia?.value.Nombre?.trim()) {
        try {
            if (competencias.value.some((p) => p.Codigo === competencia.value.Codigo)) {
                await CompetenciaService.updateCompetencia(competencia.value);
                competencias.value[findIndexById(competencia.value.Codigo)] = competencia.value;
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencia actualizada', life: 3000 });
            } else {
                const { data } = await CompetenciaService.saveCompetencia(competencia.value);
                competencias.value.push(data);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencia creada', life: 3000 });
            }

            const data = await CompetenciaService.getCompetencias();
            competencias.value = data;

            competenciaDialog.value = false;
            competencia.value = {};
        } catch (error) {
            console.error('Error al guardar la competencia:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la competencia', life: 3000 });
        }
    }
}

function editCompetencia(c) {
    competencia.value = { ...c };
    competenciaDialog.value = true;
}

function confirmDeleteCompetencia(c) {
    competencia.value = c;
    deleteCompetenciaDialog.value = true;
}

async function deleteCompetencia() {
    try {
        await CompetenciaService.deleteCompetencia(competencia.value.Codigo);
        competencias.value = competencias.value.filter((val) => val.Codigo !== competencia.value.Codigo);
        deleteCompetenciaDialog.value = false;
        competencia.value = {};
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencia eliminada', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar la competencia:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la competencia', life: 3000 });
    }
}

function findIndexById(Codigo) {
    return competencias.value.findIndex((c) => c.Codigo === Codigo);
}

function exportCSV() {
    dt.value.exportCSV();
}

async function deleteSelectedCompetencias() {
    try {
        const deletePromises = selectedCompetencias.value.map((competencia) => CompetenciaService.deleteCompetencia(competencia.Codigo));
        await Promise.all(deletePromises);
        competencias.value = competencias.value.filter((val) => !selectedCompetencias.value.includes(val));
        deleteCompetenciasDialog.value = false;
        selectedCompetencias.value = null;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencias eliminadas', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar las competencias:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar las competencias', life: 3000 });
    }
}

import Dropdown from 'primevue/dropdown';

const tipoOptions = [
    { label: 'Trasversal', value: 'Trasversal' },
    { label: 'Tecnica', value: 'Tecnica' }
];
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva competencia" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedCompetencias"
                :value="competencias"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} competencias"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Competencias</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Tipo" header="Tipo" sortable style="min-width: 12rem"></Column>
                <Column field="Descripcion" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCompetencia(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCompetencia(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar competencia -->
        <Dialog v-model:visible="competenciaDialog" :style="{ width: '450px' }" header="Detalles de la Competencia" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="Nombre" v-model.trim="competencia.Nombre" required="true" autofocus :invalid="submitted && !competencia.Nombre" fluid />
                    <small v-if="submitted && !competencia.Nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="Descripcion" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="Descripcion" v-model="competencia.Descripcion" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <!--opcion para el tipo-->
                    <label for="Tipo" class="block font-bold mb-3">Tipo</label>
                    <Dropdown id="Tipo" v-model="competencia.Tipo" :options="tipoOptions" optionLabel="label" optionValue="value" placeholder="Selecciona un tipo" required />
                </div>

                <div>
                    <label for="Codigo" class="block font-bold mb-3">Código</label>
                    <InputText id="Codigo" v-model="competencia.Codigo" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveCompetencia" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteCompetenciaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="competencia"
                    >¿Seguro que deseas eliminar <b>{{ competencia.Nombre }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCompetenciaDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteCompetencia" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación de múltiples -->
        <Dialog v-model:visible="deleteCompetenciasDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>¿Seguro que deseas eliminar las competencias seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCompetenciasDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteSelectedCompetencias" />
            </template>
        </Dialog>
    </div>
</template>
