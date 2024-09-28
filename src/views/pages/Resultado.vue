<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const resultados = ref([]);
const resultadoDialog = ref(false);
const deleteResultadoDialog = ref(false);
const deleteResultadosDialog = ref(false);
const resultado = ref({});
const selectedResultados = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener los resultados de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga los resultados
    // Por ejemplo: ResultadoService.getResultados().then(data => (resultados.value = data));
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

function saveResultado() {
    submitted.value = true;

    if (resultado?.value.Nombre?.trim()) {
        if (resultado.value.id) {
            resultados.value[findIndexById(resultado.value.id)] = resultado.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultado actualizado', life: 3000 });
        } else {
            resultado.value.id = createId();
            resultados.value.push(resultado.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultado creado', life: 3000 });
        }

        resultadoDialog.value = false;
        resultado.value = {};
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

function deleteResultado() {
    resultados.value = resultados.value.filter((val) => val.id !== resultado.value.id);
    deleteResultadoDialog.value = false;
    resultado.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultado eliminado', life: 3000 });
}

function findIndexById(id) {
    return resultados.value.findIndex((r) => r.id === id);
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
    deleteResultadosDialog.value = true;
}

function deleteSelectedResultados() {
    resultados.value = resultados.value.filter((val) => !selectedResultados.value.includes(val));
    deleteResultadosDialog.value = false;
    selectedResultados.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Resultados eliminados', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Resultado" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedResultados || !selectedResultados.length" />
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

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Descripcion" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column field="id_competencia" header="ID Competencia" sortable style="min-width: 12rem"></Column>
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
                    <label for="id_competencia" class="block font-bold mb-3">ID Competencia</label>
                    <InputText id="id_competencia" v-model="resultado.id_competencia" required="true" type="number" />
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
                <span v-if="resultado">¿Seguro que deseas eliminar <b>{{ resultado.Nombre }}</b>?</span>
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
