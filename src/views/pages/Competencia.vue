<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const items = ref([]);
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const item = ref({});
const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener los datos de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga los ítems
    // Por ejemplo: ItemService.getItems().then(data => (items.value = data));
});

// Funciones para el manejo de ítems
function openNew() {
    item.value = {};
    submitted.value = false;
    itemDialog.value = true;
}

function hideDialog() {
    itemDialog.value = false;
    submitted.value = false;
}

function saveItem() {
    submitted.value = true;

    if (item?.value.Nombre?.trim()) {
        if (item.value.id) {
            items.value[findIndexById(item.value.id)] = item.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Ítem actualizado', life: 3000 });
        } else {
            item.value.id = createId();
            items.value.push(item.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Ítem creado', life: 3000 });
        }

        itemDialog.value = false;
        item.value = {};
    }
}

function editItem(i) {
    item.value = { ...i };
    itemDialog.value = true;
}

function confirmDeleteItem(i) {
    item.value = i;
    deleteItemDialog.value = true;
}

function deleteItem() {
    items.value = items.value.filter((val) => val.id !== item.value.id);
    deleteItemDialog.value = false;
    item.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Ítem eliminado', life: 3000 });
}

function findIndexById(id) {
    return items.value.findIndex((i) => i.id === id);
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
    deleteItemsDialog.value = true;
}

function deleteSelectedItems() {
    items.value = items.value.filter((val) => !selectedItems.value.includes(val));
    deleteItemsDialog.value = false;
    selectedItems.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Ítems eliminados', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva competencia" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedItems || !selectedItems.length" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedItems"
                :value="items"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ítems"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Ítems</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="Codigo" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="Nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="Tipo" header="Tipo" sortable style="min-width: 12rem"></Column>
                <Column field="Descripcion" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteItem(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar ítem -->
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Detalles del Ítem" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="Nombre" v-model.trim="item.Nombre" required="true" autofocus :invalid="submitted && !item.Nombre" fluid />
                    <small v-if="submitted && !item.Nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="Descripcion" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="Descripcion" v-model="item.Descripcion" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="Tipo" class="block font-bold mb-3">Tipo</label>
                    <InputText id="Tipo" v-model="item.Tipo" required="true" placeholder="Tipo" />
                </div>

                <div>
                    <label for="Codigo" class="block font-bold mb-3">Código</label>
                    <InputText id="Codigo" v-model="item.Codigo" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveItem" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteItemDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="item">¿Seguro que deseas eliminar <b>{{ item.Nombre }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteItemDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteItem" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteItemsDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="item">¿Seguro que deseas eliminar los ítems seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteItemsDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedItems" />
            </template>
        </Dialog>
    </div>
</template>
