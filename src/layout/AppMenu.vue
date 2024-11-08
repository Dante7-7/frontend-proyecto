<script setup>
import 'primeicons/primeicons.css';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const userRole = localStorage.getItem('userRole');

// Define el menú completo, sin filtro
const fullMenuModel = [
    {
        label: 'Hogar',
        items: [{ label: 'Hogar', icon: 'pi pi-fw pi-home', to: '/dashboard', roles: ['Admin', 'Instructor', 'Coordinador'] }]
    },
    {
        label: 'Paginas',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'usuarios',
                icon: 'pi pi-id-card',
                to: '/pages/usuarios',
                roles: ['Admin', 'Coordinador']
            },
            {
                label: 'Programa',
                icon: 'pi pi-briefcase',
                to: '/pages/crud',
                roles: ['Admin']
            },
            {
                label: 'Competencia',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/competencia',
                roles: ['Admin']
            },
            {
                label: 'Resultado',
                icon: 'pi pi-file-edit',
                to: '/pages/resultado',
                roles: ['Admin']
            },
            {
                label: 'Guias',
                icon: 'pi pi-file-pdf',
                to: '/pages/guias',
                roles: ['Admin', 'Coordinador']
            },
            {
                label: 'Relacion-Programa-Competencia',
                icon: 'pi pi-link',
                to: '/pages/relacion_programa_competencia',
                roles: ['Admin']
            }
        ]
    }
];

// Filtrar el menú según el rol del usuario
const model = computed(() => {
    return fullMenuModel
        .map((section) => {
            // Filtrar solo las rutas que coincidan con el rol del usuario
            const filteredItems = section.items?.filter((item) => item.roles.includes(userRole));

            // Si hay elementos visibles para este usuario, incluir la sección
            if (filteredItems && filteredItems.length > 0) {
                return { ...section, items: filteredItems };
            }
            return null;
        })
        .filter((section) => section); // Eliminar secciones vacías
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item.label">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
