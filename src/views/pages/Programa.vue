<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

// Inicializar datos y estados
const toast = useToast();
const dt = ref();
const courses = ref([]);
const courseDialog = ref(false);
const deleteCourseDialog = ref(false);
const deleteCoursesDialog = ref(false);
const course = ref({});
const selectedCourses = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Al montar el componente, puedes obtener los cursos de un servicio o API
onMounted(() => {
    // Aquí podrías llamar un servicio que obtenga los cursos
    // Por ejemplo: CourseService.getCourses().then(data => (courses.value = data));
});

// Funciones para el manejo de cursos
function openNew() {
    course.value = {};
    submitted.value = false;
    courseDialog.value = true;
}

function hideDialog() {
    courseDialog.value = false;
    submitted.value = false;
}

function saveCourse() {
    submitted.value = true;

    if (course?.value.name?.trim()) {
        if (course.value.id) {
            courses.value[findIndexById(course.value.id)] = course.value;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Curso actualizado', life: 3000 });
        } else {
            course.value.id = createId();
            courses.value.push(course.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Curso creado', life: 3000 });
        }

        courseDialog.value = false;
        course.value = {};
    }
}

function editCourse(c) {
    course.value = { ...c };
    courseDialog.value = true;
}

function confirmDeleteCourse(c) {
    course.value = c;
    deleteCourseDialog.value = true;
}

function deleteCourse() {
    courses.value = courses.value.filter((val) => val.id !== course.value.id);
    deleteCourseDialog.value = false;
    course.value = {};
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Curso eliminado', life: 3000 });
}

function findIndexById(id) {
    return courses.value.findIndex((c) => c.id === id);
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
    deleteCoursesDialog.value = true;
}

function deleteSelectedCourses() {
    courses.value = courses.value.filter((val) => !selectedCourses.value.includes(val));
    deleteCoursesDialog.value = false;
    selectedCourses.value = null;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cursos eliminados', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Curso" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedCourses || !selectedCourses.length" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedCourses"
                :value="courses"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cursos"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Cursos</h4>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="code" header="Código" sortable style="min-width: 12rem"></Column>
                <Column field="name" header="Nombre" sortable style="min-width: 16rem"></Column>
                <Column field="creationDate" header="Fecha de Creación" sortable style="min-width: 12rem"></Column>
                <Column field="description" header="Descripción" sortable style="min-width: 20rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCourse(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCourse(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para agregar/editar curso -->
        <Dialog v-model:visible="courseDialog" :style="{ width: '450px' }" header="Detalles del Curso" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Nombre</label>
                    <InputText id="name" v-model.trim="course.name" required="true" autofocus :invalid="submitted && !course.name" fluid />
                    <small v-if="submitted && !course.name" class="text-red-500">El nombre es obligatorio.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="description" v-model="course.description" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="creationDate" class="block font-bold mb-3">Fecha de Creación</label>
                    <InputText id="creationDate" v-model="course.creationDate" required="true" placeholder="yyyy-mm-dd" />
                </div>

                <div>
                    <label for="code" class="block font-bold mb-3">Código del Curso</label>
                    <InputText id="code" v-model="course.code" required="true" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveCourse" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar la eliminación -->
        <Dialog v-model:visible="deleteCourseDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="course">¿Seguro que deseas eliminar <b>{{ course.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCourseDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteCourse" />
            </template>
        </Dialog>

        <!-- Dialog para confirmar eliminación múltiple -->
        <Dialog v-model:visible="deleteCoursesDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="course">¿Seguro que deseas eliminar los cursos seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCoursesDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteSelectedCourses" />
            </template>
        </Dialog>
    </div>
</template>
