<script setup>
import ResultadoService from '@/service/ResultadoService';
import { FilterMatchMode } from '@primevue/core/api';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const resultados = ref([]);
const resultadoDialog = ref(false);
const deleteResultadoDialog = ref(false);
const deleteResultadosDialog = ref(false);
const resultado = ref({});
const selectedResultados = ref();
const competencias = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const data = await ResultadoService.getResultados();
        resultados.value = data;
    } catch (error) {
        console.error('Error al cargar los resultados:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los resultados', life: 3000 });
    }
    try {
        const data = await ResultadoService.getCompetencias();
        competencias.value = data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las competencias', life: 3000 });
    }
});

// Funciones para el manejo de resultados
function openNew() {
    resultado.value = {};
    submitted.value = false;
    resultadoDialog.value = true;
}

function hideDialog() {
    resultadoDialog.value = false;
    submitted.value = false;
}
async function refreshArchivos() {
    const data = await ResultadoService.getResultados();
    resultados.value = data;
}
async function saveResultado() {
    submitted.value = true;

    if (resultado?.value.Nombre?.trim()) {
        try {
            const resultadoData = { ...resultado.value };

            if (resultados.value.some((p) => p.Codigo === resultado.value.Codigo)) {
                await ResultadoService.updateResultado(resultadoData.Codigo, resultadoData);
                resultados.value[findIndexByCodigo(resultadoData.Codigo)] = resultados.value;
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultado actualizado', life: 3000 });
            } else {
                const { data } = await ResultadoService.createResultado(resultadoData);
                resultados.value.push(data);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultado creado', life: 3000 });
            }

            await refreshArchivos();
            resultadoDialog.value = false;
            resultado.value = {};
        } catch (error) {
            console.error('Error al guardar el resultado:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el resultado', life: 3000 });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor completa todos los campos requeridos.', life: 3000 });
    }
}

function editResultado(r) {
    resultado.value = { ...r };
    resultadoDialog.value = true;
}

function confirmDeleteResultado(r) {
    resultado.value = r;
    deleteResultadoDialog.value = true;
}

async function deleteResultado() {
    try {
        await ResultadoService.deleteResultado(resultado.value.Codigo);
        resultados.value = resultados.value.filter((val) => val.Codigo !== resultado.value.Codigo);
        deleteResultadoDialog.value = false;
        resultado.value = {};
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'resultado eliminado', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar el resultado:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el resultado', life: 3000 });
    }
}

function findIndexByCodigo(Codigo) {
    return resultados.value.findIndex((r) => r.Codigo === Codigo);
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

async function deleteSelectedResultados() {
    try {
        const deletePromises = selectedResultados.value.map((resultado) => ResultadoService.deleteResultado(resultado.id));
        await Promise.all(deletePromises);
        resultados.value = resultados.value.filter((val) => !selectedResultados.value.includes(val));
        deleteResultadoDialog.value = false;
        selectedResultados.value = null;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultados eliminados', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar los programas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar los resultados', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Resultado" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedResultados"
                :value="resultados"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} resultados"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Resultados</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Descripcion" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column field="competencia.Nombre" header="Competencia" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editResultado(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteResultado(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar resultado -->
        <Dialog v-model:visible="resultadoDialog" :style="{ width: '450px' }" header="Detalles del Resultado" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="Nombre" v-model.trim="resultado.Nombre" required="true" autofocus :invalid="submitted && !resultado.Nombre" fluid />
                    <small v-if="submitted && !resultado.Nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="Descripcion" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="Descripcion" v-model="resultado.Descripcion" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="id_competencia" class="block font-bold mb-3">Competencia</label>
                    <Select id="id_competencia" v-model="resultado.id_competencia" :options="competencias" optionLabel="Nombre" optionValue="ID" placeholder="Selecciona una competencia" required />
                    <small v-if="submitted && !resultado.id_competencia" class="text-red-500">La competencia es obligatoria.</small>
                </div>

                <div>
                    <label for="Codigo" class="block font-bold mb-3">Código del Resultado</label>
                    <InputText id="Codigo" v-model="resultado.Codigo" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveResultado" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteResultadoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="resultado"
                    >¿Seguro que deseas eliminar <b>{{ resultado.Nombre }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteResultadoDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteResultado" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteResultadosDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="resultado">¿Seguro que deseas eliminar los resultados seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteResultadosDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedResultados" />
            </template>
        </Dialog>
    </div>
</template>
