<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import 'primeicons/primeicons.css';




const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Home', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [

            /*{
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },*/
            {
                label: 'Programa',
                icon: 'pi pi-briefcase',
                to: '/pages/crud'
            },

            {
                label: 'usuarios',
                icon:  'pi pi-id-card',
                to:'/pages/usuarios'
            },
            {
                label: 'Competencia',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/competencia'
            },
            {
                label: 'Resultado',
                icon: 'pi pi-file-edit',
                to: '/pages/resultado'
            },
            {
                label: 'Guias',
                icon: 'pi pi-file-pdf',
                to: '/pages/guias'
            },

        ]
    },
    
    
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
