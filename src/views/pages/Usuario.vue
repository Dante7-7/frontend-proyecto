<script setup>
import RelacionPCService from '@/service/RelacionPCService';
import UsuarioService from '@/service/UsuarioService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const usuarios = ref([]);
const roles = ref([]);
const usuarioDialog = ref(false);
const deleteUsuarioDialog = ref(false);
const deleteUsuariosDialog = ref(false);
const rolSeleccionado = ref(null);
const usuario = ref({});
const isNewUser = ref(true);
const selectedUsuarios = ref();
const competenciasDialog = ref(false);
const competenciasDisponibles = ref([]);
const competenciasSeleccionadas = ref([]);
const usuarioSeleccionado = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const response = await UsuarioService.getUsuarios();
        console.log(usuarios);
        usuarios.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener usuarios', life: 3000 });
    }
    try {
        const data = await UsuarioService.getRoles();
        roles.value = data;
    } catch (error) {
        console.error('Error al cargar los roles:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de roles', life: 3000 });
    }
    try {
        const response = await RelacionPCService.getCompetencias();
        competenciasDisponibles.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de competencias', life: 3000 });
    }
});

// Funciones para el manejo de usuarios
function openNew() {
    rolSeleccionado.value = null;
    isNewUser.value = true;
    usuario.value = {};
    submitted.value = false;
    usuarioDialog.value = true;
}

function hideDialog() {
    usuarioDialog.value = false;
    submitted.value = false;
}

async function refresh() {
    const response = await UsuarioService.getUsuarios();
    usuarios.value = response;
}

async function saveUsuario() {
    submitted.value = true;
    // validacion de contraseña si es un nuevo usuario
    if (isNewUser.value && !validatePassword(usuario.value.password)) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'La contraseña debe cumplir con los requisitos de seguridad.', life: 3000 });
        return;
    }

    // Solo requerir campos necesarios al actualizar
    if (usuario?.value.name?.trim() && usuario?.value.email?.trim() && usuario?.value.cedula?.trim() && usuario?.value.telefono?.trim() && (isNewUser.value ? rolSeleccionado.value : true)) {
        if (isNewUser.value) {
            usuario.value.role = rolSeleccionado.value.id;
        }

        if (usuario.value.id) {
            // Actualizar usuario en el backend
            await UsuarioService.updateUsuario(usuario.value.id, { name: usuario.value.name, email: usuario.value.email, cedula: usuario.value.cedula, telefono: usuario.value.telefono });
            usuarios.value[findIndexById(usuario.value.id)] = usuario.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
        } else {
            // Crear nuevo usuario en el backend
            const data = await UsuarioService.createUsuario(usuario.value);
            usuarios.value.push(data);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
        }
        await refresh();
        usuarioDialog.value = false;
        usuario.value = {};
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete todos los campos obligatorios.', life: 3000 });
    }
}

function editUsuario(u) {
    usuario.value = { ...u };
    usuarioDialog.value = true;
    isNewUser.value = false;
}

function confirmDeleteUsuario(u) {
    usuario.value = u;
    deleteUsuarioDialog.value = true;
}

async function deleteUsuario() {
    try {
        console.log(usuario.value.id);
        await UsuarioService.deleteUsuario(usuario.value.id);
        usuarios.value = usuarios.value.filter((val) => val.id !== usuario.value.id);
        deleteUsuarioDialog.value = false;
        usuario.value = {};
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario', life: 3000 });
    }
}

function findIndexById(id) {
    return usuarios.value.findIndex((u) => u.id === id);
}

async function deleteSelectedUsuarios() {
    usuarios.value = usuarios.value.filter((val) => !selectedUsuarios.value.includes(val));
    deleteUsuariosDialog.value = false;
    selectedUsuarios.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuarios eliminados', life: 3000 });
}
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-.,¿¡])[A-Za-z\d@$!%*?&\-.,¿¡]{8,}$/;
    return regex.test(password);
}

async function openAssignCompetencias(usuario) {
    usuarioSeleccionado.value = usuario;
    competenciasDialog.value = true;
}

async function saveCompetencias() {
    try {
        console.log('ids', competenciasSeleccionadas.value);
        const response = await UsuarioService.agregarCompetenciasAUsuario(usuarioSeleccionado.value.id, competenciasSeleccionadas.value);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.data.mensaje,
            life: 3000
        });
        await refresh();
        competenciasDialog.value = false;
        competenciasSeleccionadas.value = [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron asignar las competencias', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Usuario" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
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

                <Column field="name" header="Nombre" sortable style="min-width: 12rem"></Column>
                <Column field="role.rol_name" header="Rol" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUsuario(slotProps.data)" />
                        <Button icon="pi pi-plus" outlined rounded class="mr-2" @click="openAssignCompetencias(slotProps.data)" label="Asignar Competencias" />
                        <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger" @click="confirmDeleteUsuario(slotProps.data)" />
                        <Dropdown :options="slotProps.data.competencias" option-label="Nombre" placeholder="Ver Competencias" style="cursor: default" showClear="false" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar usuario -->
        <Dialog v-model:visible="usuarioDialog" :style="{ width: '450px' }" header="Detalles del Usuario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Nombre</label>
                    <InputText id="name" v-model.trim="usuario.name" required="true" autofocus :invalid="submitted && !usuario.name" fluid />
                    <small v-if="submitted && !usuario.name" class="text-red-500">El nombre es obligatorio.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model="usuario.email" required="true" type="email" :invalid="submitted && !usuario.email" fluid />
                    <small v-if="submitted && !usuario.email" class="text-red-500">El email es obligatorio.</small>
                </div>
                <div>
                    <label for="cedula" class="block font-bold mb-3">Cédula</label>
                    <InputText id="cedula" v-model="usuario.cedula" required="true" :invalid="submitted && !usuario.cedula" fluid />
                    <small v-if="submitted && !usuario.cedula" class="text-red-500">La cédula es obligatoria.</small>
                </div>
                <div>
                    <label for="telefono" class="block font-bold mb-3">Teléfono</label>
                    <InputText id="telefono" v-model="usuario.telefono" required="true" :invalid="submitted && !usuario.telefono" fluid />
                    <small v-if="submitted && !usuario.telefono" class="text-red-500">El teléfono es obligatorio.</small>
                </div>

                <div v-if="isNewUser">
                    <label for="password" class="block font-bold mb-3">Contraseña</label>
                    <Password id="password" v-model="usuario.password" toggleMask />
                    <small v-if="submitted && !validatePassword(usuario.password)" class="text-red-500">La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial.</small>
                </div>

                <!-- Mostrar rol solo si es nuevo usuario -->
                <div v-if="isNewUser">
                    <label for="role" class="block font-bold mb-3">Rol</label>
                    <Dropdown id="role" v-model="rolSeleccionado" :options="roles" option-label="rol_name" placeholder="Selecciona un rol" fluid />
                    <small v-if="submitted && !rolSeleccionado" class="text-red-500">El rol es obligatorio.</small>
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
        <!--dialog para agregar competencias a los usuarios-->
        <Dialog v-model:visible="competenciasDialog" :style="{ width: '450px' }" header="Asignar Competencias" :modal="true">
            <div>
                <label for="competencias" class="block font-bold mb-3">Selecciona Competencias</label>
                <MultiSelect id="competencias" v-model="competenciasSeleccionadas" :options="competenciasDisponibles" option-label="Nombre" option-value="ID" placeholder="Selecciona competencias" style="width: 100%" />
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="competenciasDialog = false" />
                <Button label="Guardar" icon="pi pi-check" @click="saveCompetencias" />
            </template>
        </Dialog>
    </div>
</template>
