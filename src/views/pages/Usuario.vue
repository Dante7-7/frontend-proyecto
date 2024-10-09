<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const usuarios = ref([]);
const usuarioDialog = ref(false);
const deleteUsuarioDialog = ref(false);
const deleteUsuariosDialog = ref(false);
const usuario = ref({});
const selectedUsuarios = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener los usuarios de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga los usuarios
});

// Funciones para el manejo de usuarios
function openNew() {
    usuario.value = {};
    submitted.value = false;
    usuarioDialog.value = true;
}

function hideDialog() {
    usuarioDialog.value = false;
    submitted.value = false;
}

function saveUsuario() {
    submitted.value = true;

    if (usuario?.value.nombre?.trim() && usuario?.value.clave?.trim()) {
        if (usuario.value.id) {
            usuarios.value[findIndexById(usuario.value.id)] = usuario.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
        } else {
            usuario.value.id = createId();
            usuarios.value.push(usuario.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
        }

        usuarioDialog.value = false;
        usuario.value = {};
    }
}

function editUsuario(u) {
    usuario.value = { ...u };
    usuarioDialog.value = true;
}

function confirmDeleteUsuario(u) {
    usuario.value = u;
    deleteUsuarioDialog.value = true;
}

function deleteUsuario() {
    usuarios.value = usuarios.value.filter((val) => val.id !== usuario.value.id);
    deleteUsuarioDialog.value = false;
    usuario.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado', life: 3000 });
}

function findIndexById(id) {
    return usuarios.value.findIndex((u) => u.id === id);
}

function createId() {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function confirmDeleteSelected() {
    deleteUsuariosDialog.value = true;
}

function deleteSelectedUsuarios() {
    usuarios.value = usuarios.value.filter((val) => !selectedUsuarios.value.includes(val));
    deleteUsuariosDialog.value = false;
    selectedUsuarios.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuarios eliminados', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Usuario" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedUsuarios || !selectedUsuarios.length" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedUsuarios"
                :value="usuarios"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Usuarios</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                <Column field="clave" header="Clave" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUsuario(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUsuario(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar usuario -->
        <Dialog v-model:visible="usuarioDialog" :style="{ width: '450px' }" header="Detalles del Usuario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="usuario.nombre" required="true" autofocus :invalid="submitted && !usuario.nombre" fluid />
                    <small v-if="submitted && !usuario.nombre" class="text-red-500">El nombre es obligatorio.</small>
                </div>
                <div>
                    <label for="clave" class="block font-bold mb-3">Clave</label>
                    <InputText id="clave" v-model="usuario.clave" required="true" type="password" :invalid="submitted && !usuario.clave" fluid />
                    <small v-if="submitted && !usuario.clave" class="text-red-500">La clave es obligatoria.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveUsuario" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteUsuarioDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="usuario"
                    >¿Seguro que deseas eliminar <b>{{ usuario.nombre }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUsuarioDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteUsuario" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteUsuariosDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="usuario">¿Seguro que deseas eliminar los usuarios seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUsuariosDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedUsuarios" />
            </template>
        </Dialog>
    </div>
</template>
