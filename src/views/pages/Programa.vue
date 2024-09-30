<script setup>
import ProgramaService from '@/service/ProgramaService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const programas = ref([]);
const programaDialog = ref(false);
const deleteProgramaDialog = ref(false);
const deleteProgramasDialog = ref(false);
const programa = ref({});
const selectedProgramas = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const data = await ProgramaService.getProgramas();
        programas.value = data;
    } catch (error) {
        console.error('Error al cargar los programas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los programas', life: 3000 });
    }
});

// Funciones para el manejo de programas
function openNew() {
    programa.value = {};
    submitted.value = false;
    programaDialog.value = true;
}

function hideDialog() {
    programaDialog.value = false;
    submitted.value = false;
}

async function savePrograma() {
    submitted.value = true;

    if (programa?.value.Nombre?.trim()) {
        try {
            if (programa.value.id) {
                await ProgramaService.savePrograma(programa.value);
                programas.value[findIndexById(programa.value.id)] = programa.value;
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Programa actualizado', life: 3000 });
            } else {
                const { data } = await ProgramaService.savePrograma(programa.value);
                programas.value.push(data);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Programa creado', life: 3000 });
            }
            const data = await ProgramaService.getProgramas();
            programas.value = data;

            programaDialog.value = false;
            programa.value = {};
        } catch (error) {
            console.error('Error al guardar el programa:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el programa', life: 3000 });
        }
    }
}

function editPrograma(p) {
    programa.value = { ...p };
    programaDialog.value = true;
}

function confirmDeletePrograma(p) {
    programa.value = p;
    deleteProgramaDialog.value = true;
}

async function deletePrograma() {
    try {
        await ProgramaService.deletePrograma(programa.value.Codigo);
        programas.value = programas.value.filter((val) => val.Codigo !== programa.value.Codigo);
        deleteProgramaDialog.value = false;
        programa.value = {};
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Programa eliminado', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar el programa:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el programa', life: 3000 });
    }
}

function findIndexById(id) {
    return programas.value.findIndex((p) => p.id === id); // Cambiado de c a p
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

function confirmDeleteSelected() {
    deleteProgramasDialog.value = true;
}

async function deleteSelectedProgramas() {
    try {
        const deletePromises = selectedProgramas.value.map((programa) => ProgramaService.deletePrograma(programa.id));
        await Promise.all(deletePromises);
        programas.value = programas.value.filter((val) => !selectedProgramas.value.includes(val));
        deleteProgramasDialog.value = false;
        selectedProgramas.value = null;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Programas eliminados', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar los programas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar los programas', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Programa" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedProgramas || !selectedProgramas.length" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProgramas"
                :value="programas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} programas"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Programas</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Descripcion" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPrograma(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePrograma(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar programa -->
        <Dialog v-model:visible="programaDialog" :style="{ width: '450px' }" header="Detalles del Programa" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="Nombre" v-model.trim="programa.Nombre" required="true" autofocus :invalid="submitted && !programa.Nombre" fluid />
                    <small v-if="submitted && !programa.Nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="Descripcion" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="Descripcion" v-model="programa.Descripcion" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="Codigo" class="block font-bold mb-3">Código del Programa</label>
                    <InputText id="Codigo" v-model="programa.Codigo" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="savePrograma" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteProgramaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="programa"
                    >¿Seguro que deseas eliminar <b>{{ programa.Nombre }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProgramaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deletePrograma" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteProgramasDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="programa">¿Seguro que deseas eliminar los programas seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProgramasDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedProgramas" />
            </template>
        </Dialog>
    </div>
</template>
